import * as core from '@actions/core';
import * as installer from './installer';

async function init() {
    try {
        if (process.env.NODE_ENV !== 'production') {
            require('dotenv').config();
        }
        const cocosVersion = core.getInput('cocos-version') || '2.4.3';
        core.debug(`cocos version to download ... ${cocosVersion}`);
        await installer.getCocosCreator(cocosVersion);
    } catch (e) {
        core.setFailed(e.message);
    }
}

init();
