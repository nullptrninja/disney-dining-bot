import { IRoutableContext } from "./IRoutableContext"
import { ProcessorResult } from "./ProcessorResult"

export class WorkflowStepResult {
    readonly output: IRoutableContext | undefined
    readonly nextRouteKey: string
    readonly processingResult: ProcessorResult
    readonly message: string

    constructor(output: IRoutableContext | undefined, nextRouteKey: string, processingResult: ProcessorResult, message: string) {
        this.output = output;
        this.nextRouteKey = nextRouteKey;
        this.processingResult = processingResult;
        this.message = message;
    }
}
