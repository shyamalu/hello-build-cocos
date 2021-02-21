import * as core from '@actions/core';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';
import * as fs from 'fs';
import * as path from 'path';
import * as helper from './helper'

export const COCOS_CREATOR = 'Creator';

export async function getCocosCreator(
    version: string
): Promise<void> {
    const platform = helper.getPlatform();
    const {
        version: selected,
        downloadUrl,
    } = await helper.decideCocosVersion(version, platform);

    let toolPath = tc.find(COCOS_CREATOR, version);
    if (toolPath) {
        core.debug(`Tool found in cache ${toolPath}`);
    } else {
        core.debug(`Downloading Cocos Creator from url ${downloadUrl}`);
        const sdkFile = await tc.downloadTool(downloadUrl);
        core.debug(`printing sdkFile ${sdkFile}`)
        const sdkCache = await tmpDir(platform);
        core.debug(`printing sdkCache ${sdkCache}`)
        const sdkDir = await extract(sdkFile, sdkCache, path.basename(downloadUrl));
        toolPath = await tc.cacheDir(sdkDir, COCOS_CREATOR, version);
    }

    core.exportVariable('COCOS_CREATOR_ROOT', toolPath);
    core.addPath(path.join(toolPath, 'bin'));
    core.addPath(path.join(toolPath, 'bin', 'cache'));
}


async function tmpDir(platform: string): Promise<string> {
    const baseDir = tmpBaseDir(platform);
    core.debug(`basedir: ${baseDir}`);
    const tempDir = path.join(
        baseDir,
        'temp_' + Math.floor(Math.random() * 2000000000)
    );

    core.debug(`tempDir: ${tempDir}`);
    await io.mkdirP(tempDir);
    core.debug(`created tempDir: ${tempDir}`);
    return tempDir;
}

function tmpBaseDir(platform: string): string {
    let tempDirectory = process.env['RUNNER_TEMP'] || '';
    if (tempDirectory) {
        return tempDirectory;
    }

    let baseLocation;

    switch (platform) {
        case 'windows':
            baseLocation = process.env['USERPROFILE'] || 'C:\\';
            break;
        case 'macos':
            baseLocation = '/Users';
            break;
        default:
            baseLocation = '/home';
            break;
    }

    return path.join(baseLocation, 'actions', 'temp');
}

async function extract(
    sdkFile: string,
    sdkCache: string,
    originalFilename: string
): Promise<string> {
    const fileStats = fs.statSync(path.normalize(sdkFile));
    core.debug(`fileStats ${JSON.stringify(fileStats)}`);
    if (fileStats.isFile()) {
        const stats = fs.statSync(sdkFile);

        if (!stats) {
            throw new Error(`Failed to extract ${sdkFile} - it doesn't exist`);
        } else if (stats.isDirectory()) {
            throw new Error(`Failed to extract ${sdkFile} - it is a directory`);
        }
        core.debug(`originalFilename ${originalFilename}`);
        if (originalFilename.endsWith('tar.xz')) {
            await tc.extractTar(sdkFile, sdkCache, 'x');
        } else {
            core.debug(`extractZip ${sdkFile} ${sdkCache}`);
            await tc.extractZip(sdkFile, sdkCache);
        }

        return path.join(sdkCache, fs.readdirSync(sdkCache)[0]);
    } else {
        throw new Error(`Cocos Creator ${sdkFile} is not a file`);
    }
}
