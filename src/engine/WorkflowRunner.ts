// This is the main running process that executes the workflows

import { IRoutableContext } from "./models/IRoutableContext";
import { RunnerDirective } from "./models/RunnerDirective";
import { WorkflowRouterResults } from "./models/WorkflowRouterResult";
import { WorkflowRouter } from "./WorkflowRouter";

export class WorkflowRunner {
    private readonly entryWorkflowStep: WorkflowRouter
    private nextRouter: WorkflowRouter | undefined
    private lastDirective: RunnerDirective
    private routeTraversalLog: string[]
    private uniqueRouteTraversalLog: string[]

    constructor(entryStep: WorkflowRouter) {
        this.entryWorkflowStep = entryStep;
        this.nextRouter = undefined;
        this.lastDirective = RunnerDirective.Continue;
        this.routeTraversalLog = new Array();
        this.uniqueRouteTraversalLog = new Array();
    }

    async executeAsync(starterContext: IRoutableContext): Promise<void> {
        let routerResults: WorkflowRouterResults
        this.nextRouter = this.entryWorkflowStep;
        this.lastDirective = RunnerDirective.Continue;

        this.nextRouter.receive(starterContext);

        while (this.lastDirective === RunnerDirective.Continue || this.lastDirective === RunnerDirective.Retry) {
            // NextRouter contains our next node (or the same one in the case of retries)
            if (this.nextRouter) {
                // Route logging
                if (this.lastDirective === RunnerDirective.Continue) {
                    this.uniqueRouteTraversalLog.push(this.nextRouter.routeKey);
                }
                this.routeTraversalLog.push(this.nextRouter.routeKey);

                routerResults = await this.nextRouter.processAsync();
                this.handleRouterResults(routerResults);
            }
            // ELSE: If the router is undefined then we're about to exit the processing loop
        }

        if (this.lastDirective === RunnerDirective.Success) {
            console.log('Workflow completed successfully');
        }
        else if (this.lastDirective === RunnerDirective.Failed) {
            console.log('Workflow did NOT complete successfully');
        }
    }

    handleRouterResults(routerResults: WorkflowRouterResults) {
        let { runnerDirective, nextRouter } = routerResults;

        // Advance the router to the next one in the workflow on "Continue"
        let nextRouteKey = nextRouter?.routeKey ?? '<N/A>';
        this.lastDirective = runnerDirective;

        console.log(`Workflow step completed with ${runnerDirective} to next step with next RouteKey: ${nextRouteKey}`);
        if (runnerDirective === RunnerDirective.Continue) {
            this.nextRouter = nextRouter;
        }
        //else if (runnerDirective === RunnerDirective.Retry) {
            // TODO: If we're able to get transactional rollbacks working on the context we should rollback here. For
            // now we have to rely on the steps themselves being good citizens and cleaning up their own contexts before
            // passing it along
        //}
    }
}
