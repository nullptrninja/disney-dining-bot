import { IRoutableContext } from "../engine/models/IRoutableContext";
import { IWorkflowStep } from "../engine/models/IWorkflowStep";
import { WorkflowStepResult } from "../engine/models/WorkflowStepResult";
import * as Constants from "../Constants"
import { ProcessorResult } from "../engine/models/ProcessorResult";

export class DevLoggingStep implements IWorkflowStep {
    static readonly MessageKey = 'message'
    static readonly OnSuccessRouteKey = 'onSuccessRouteKey'
    private config: any

    constructor(config: any) {
        this.config = config;
    }

    processStepAsync(input: IRoutableContext | undefined): Promise<WorkflowStepResult> {
        let msg = input?.context[DevLoggingStep.MessageKey] || 'Missing message field from input context';
        let onSuccessRouteKey = this.config[DevLoggingStep.OnSuccessRouteKey] || Constants.DefaultRouteKey;

        // Our "action" for the step
        console.log(`STEP ACTION! Message: ${msg}`);

        let result = new WorkflowStepResult(input, onSuccessRouteKey, ProcessorResult.Success, 'Successfully ran the step');
        return Promise.resolve(result);
    }
}
