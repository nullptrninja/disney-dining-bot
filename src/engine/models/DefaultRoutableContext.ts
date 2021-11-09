import { RunProfile } from "../../models/RunProfile";
import { IRoutableContext } from "./IRoutableContext";

export class DefaultRoutableContext implements IRoutableContext {
    runProfile: RunProfile;
    context: any;

    constructor(runProfile: RunProfile, initialContext: any) {
        this.runProfile = runProfile;
        this.context = initialContext;
    }
}
