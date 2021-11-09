/*
    This behaves as both a receiving endpoint and a 1-element synchronous queue.
*/
import { IRoutableContext } from "./models/IRoutableContext";
import { ProcessorResult } from "./models/ProcessorResult";
import * as Constants from "../Constants";
import { RunnerDirective } from "./models/RunnerDirective";
import { IWorkflowStep } from "./models/IWorkflowStep";
import { WorkflowStepResult } from "./models/WorkflowStepResult";
import { WorkflowRouterResults } from "./models/WorkflowRouterResult";

export class WorkflowRouter {
    private currentContext: IRoutableContext | undefined
    private stepProcessor: IWorkflowStep | undefined
    private nextRouters: WorkflowRouter[] | undefined
    private processedRetryCount: number
    readonly routeKey: string

    constructor(routeKey: string, stepProcessor: IWorkflowStep | undefined, nextRouters: WorkflowRouter[] | undefined) {
        this.routeKey = routeKey;
        this.currentContext = undefined;
        this.stepProcessor = stepProcessor;
        this.nextRouters = nextRouters;
        this.processedRetryCount = 0;
    }

    canReceive(routeKey: string): boolean {
        return this.stepProcessor !== undefined && this.routeKey === routeKey;
    }

    receive(input: IRoutableContext | undefined): void {
        this.currentContext = input;
        this.processedRetryCount = 0;
    }

    async processAsync(): Promise<WorkflowRouterResults> {
        let r: WorkflowStepResult;
        if (this.currentContext && this.stepProcessor) {
            try {
                r = await this.stepProcessor.processStepAsync(this.currentContext)
            }
            catch(e)    {
                console.log(`Workflow processing encountered an error and will terminate:\nCurrent RouteKey: ${this.routeKey}\nRetries attempted:${this.processedRetryCount}\n\n${e}`);
                this.currentContext = undefined;
                return Promise.resolve(new WorkflowRouterResults(RunnerDirective.Failed, undefined));
            }

            if (r.processingResult === ProcessorResult.Success) {
                // If no output context from result, we consider this terminal condition
                if (r.output === undefined) {
                    console.log(`Processing result was successful and contained no output context. Terminating as successful.\nLast message: ${r.message}`);
                    return Promise.resolve(new WorkflowRouterResults(RunnerDirective.Success, undefined));
                }
                else {
                    // Route to appropriate nextRouters
                    console.log(`Processing result was successful, now sending to eligible routers matching RouteKey: ${r.nextRouteKey}\nLast message: ${r.message}`);

                    let targetRouters = this.nextRouters?.filter(r => r.canReceive(r.routeKey));
                    if (targetRouters?.length === 0) {
                        // Try to search for default routers
                        targetRouters = this.nextRouters?.filter(r => r.routeKey === Constants.DefaultRouteKey);
                    }

                    if (targetRouters?.length) {
                        console.log(`Found first router with RouteKey: ${r.nextRouteKey}, sending to that router...`);

                        targetRouters[0].receive(r.output);
                        this.currentContext = undefined;
                        return Promise.resolve(new WorkflowRouterResults(RunnerDirective.Continue, targetRouters[0]));
                    }
                    else {
                        console.log(`Found no routers with RouteKey: ${r.nextRouteKey}, this may be a configuration error. Terminating as a failure.`);
                        this.currentContext = undefined;
                        return Promise.resolve(new WorkflowRouterResults(RunnerDirective.Failed, undefined));
                    }
                }
            }
            else if (r.processingResult === ProcessorResult.Retry) {
                // Do no clear current context, log out retry and increment retry count on context
                console.log(`Processing result was retry. Current retries attempted: ${this.processedRetryCount}\nLast message: ${r.message}`);
                this.processedRetryCount++;

                // Exceeded retry count
                if (this.processedRetryCount >= Constants.MaxRetriesPerStep) {
                    console.log(`We've exceeded our allowable retries. Current: ${this.processedRetryCount} Maximum: ${Constants.MaxRetriesPerStep}`);
                    return Promise.resolve(new WorkflowRouterResults(RunnerDirective.Failed, undefined));
                }
                else {
                    return Promise.resolve(new WorkflowRouterResults(RunnerDirective.Retry, undefined));
                }
            }
            else {
                // Normally fails are exceptions, but not all of them may necessaily be. Here we fail permanently still.
                // Clear context, log out perm fail
                console.log(`Processing result was Failure (but without an exception).\nLast message: ${r.message}`);
                this.currentContext = undefined;
                this.processedRetryCount = 0;
                return Promise.resolve(new WorkflowRouterResults(RunnerDirective.Failed, undefined));
            }
        }

        return Promise.reject(new Error('Router is missing both step and context required for execution'));
    }
}
