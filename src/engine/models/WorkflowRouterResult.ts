import { WorkflowRouter } from "../WorkflowRouter"
import { RunnerDirective } from "./RunnerDirective"

export class WorkflowRouterResults {
    readonly runnerDirective: RunnerDirective
    readonly nextRouter: WorkflowRouter | undefined

    constructor(runnerDirective: RunnerDirective, nextRouter: WorkflowRouter | undefined) {
        this.runnerDirective = runnerDirective;
        this.nextRouter = nextRouter;
    }
}
