// IWorkflowSteps are discrete steps within the workflow. This defines the core interface needed to implement
// a step. The steps are then executed on top a WorkflowStepHost in order to isolate the business logic from
// any underlying infrastructure concerns.

import { IRoutableContext } from "./IRoutableContext";
import { WorkflowStepResult } from "./WorkflowStepResult";

export interface IWorkflowStep {
    processStepAsync(input: IRoutableContext | undefined): Promise<WorkflowStepResult>
}
