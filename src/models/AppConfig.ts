import fs from 'fs';

export class AppConfig {
    defaultProfile: string

    constructor(appConfigFile: string) {
        let appConf = JSON.parse(fs.readFileSync(appConfigFile, 'utf-8'));

        this.defaultProfile = appConf.defaultProfile;
    }
}
