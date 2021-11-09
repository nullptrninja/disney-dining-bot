import fs from 'fs';

export class RunProfile {
    wdwUsername: string
    wdwPassword: string
    wdwBaseUrl: string

    constructor(profileFile: string) {
        let profile = JSON.parse(fs.readFileSync(profileFile, 'utf-8'));

        this.wdwUsername = profile.wdwUsername;
        this.wdwPassword = profile.wdwPassword;
        this.wdwBaseUrl = profile.wdwBaseUrl;
    }
}
