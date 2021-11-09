import { RunProfile } from "../../models/RunProfile";

export interface IRoutableContext {
    runProfile: RunProfile
    context: any
}
