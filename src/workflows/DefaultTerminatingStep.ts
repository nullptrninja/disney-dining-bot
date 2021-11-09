import { IRoutableContext } from "../engine/models/IRoutableContext";
import { IWorkflowStep } from "../engine/models/IWorkflowStep";
import { WorkflowStepResult } from "../engine/models/WorkflowStepResult";
import * as Constants from "../Constants"
import { ProcessorResult } from "../engine/models/ProcessorResult";

/*
    Acts as a configurable terminating node for a workflow to be used to report a user specified result back
    to the WorkflowRunner.

    To configure:
    {
        "result": <ProcessorResult>         This is the result you want to report back to the Runner
    }
*/
export class DefaultTerminatingStep implements IWorkflowStep {
    static readonly StepResultKey = 'result'
    private config: any

    constructor(config: any) {
        this.config = config;
    }

    processStepAsync(input: IRoutableContext | undefined): Promise<WorkflowStepResult> {
        let stepResult = <ProcessorResult>this.config[DefaultTerminatingStep.StepResultKey];
        let result = new WorkflowStepResult(undefined, Constants.DefaultRouteKey ,stepResult, 'This is a terminating step');
        return Promise.resolve(result);
    }
}
