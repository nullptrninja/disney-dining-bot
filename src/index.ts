// Entry point

import { AppConfigFile } from './Constants';
import { DefaultRoutableContext } from './engine/models/DefaultRoutableContext';
import { ProcessorResult } from './engine/models/ProcessorResult';
import { WorkflowRouter } from './engine/WorkflowRouter';
import { WorkflowRunner } from './engine/WorkflowRunner';
import { AppConfig } from './models/AppConfig';
import { RunProfile } from './models/RunProfile';
import { DefaultTerminatingStep } from './workflows/DefaultTerminatingStep';
import { DevLoggingStep } from './workflows/DevLoggingStep';
import * as Constants from './Constants'

let appConfig: AppConfig;

function init(): void {
    console.log(`Reading appconfig from: ${AppConfigFile}`);
    appConfig = new AppConfig(AppConfigFile);

    console.log(`Using profile: ${appConfig.defaultProfile}`);
}

async function main(): Promise<void> {
    let step1 = new DevLoggingStep({ 'onSuccessRouteKey': 'step2'});
    let step2 = new DevLoggingStep({ 'onSuccessRouteKey': 'end'});
    let step3 = new DevLoggingStep({});
    let step4terminal = new DefaultTerminatingStep({ 'result': ProcessorResult.Success });

    let step4Router = new WorkflowRouter(Constants.DefaultRouteKey, step4terminal, undefined);
    let step3Router = new WorkflowRouter('end', step3, [ step4Router ]);
    let step2Router = new WorkflowRouter('step2', step2, [ step3Router ]);
    let step1Router = new WorkflowRouter('start', step1, [ step2Router ]);

    let runner = new WorkflowRunner(step1Router);
    let runProfile = new RunProfile(appConfig.defaultProfile);
    let dataContext = {
        'message': 'Hello!'
    };
    let inputContext = new DefaultRoutableContext(runProfile, dataContext);

    await runner.executeAsync(inputContext);
    Promise.resolve();
}

init();
main().catch(e => console.log(`An error occurred that terminated the application: ${e}`));
