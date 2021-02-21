import * as core from '@actions/core';
import * as installer from './installer';

async function init() {
    try {
        if (process.env.NODE_ENV !== 'production') {
            require('dotenv').config();
        }
        console.log('Now the value for RUNNER_TOOL_CACHE is:', process.env.RUNNER_TOOL_CACHE);

        const cocosVersion = core.getInput('cocos-version') || '2.4.3';
        await installer.getCocosCreator(cocosVersion);
    } catch (e) {
        core.setFailed(e.message);
    }
}

init();
