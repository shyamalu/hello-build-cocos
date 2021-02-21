import * as core from '@actions/core';
import * as httpm from '@actions/http-client';
import * as semver from 'semver';

export const releaseUrl =
    'https://creator-api.cocos.com/api/cocoshub/editor_version_list';

interface ICocosRelease {
    version: string;
    darwin: string;
    win32: string;
}

interface ICocosReleaseInfo {
    "2d": ICocosRelease[];
    "3d": ICocosRelease[];
}

interface ICocosCreatorStorage {
    status: string;
    msg: string;
    data: ICocosReleaseInfo;
}

interface ICocosCreatorDownloadData {
    version: string;
    downloadUrl: string;
}


export function getPlatform(): string {
    const platform = process.platform;

    if (platform == 'win32') {
        return 'win32';
    }

    if (platform == 'darwin') {
        return 'darwin';
    }

    return platform;
}

export async function decideCocosVersion(
    version: string,
    platform: string
): Promise<ICocosCreatorDownloadData> {
    const storage = await getReleases();
    return getVersion(storage, version, platform);
}

async function getVersion(
    storage: ICocosCreatorStorage,
    version: string,
    platform: string
): Promise<ICocosCreatorDownloadData> {
    let release = storage.data["2d"].find(release => {
        console.log(release);
        return release.version === version
    });

    if (!release) {
        release = storage.data["2d"][0]
    }

    const cocosData = {
        version: release.version,
        // @ts-ignore
        downloadUrl: release[platform]
    };
    return cocosData;
}


async function getReleases(): Promise<ICocosCreatorStorage> {
    const releasesUrl: string = `${releaseUrl}`;
    const http: httpm.HttpClient = new httpm.HttpClient('cosos-creator-github-action');
    const storage: ICocosCreatorStorage | null = (
        await http.getJson<ICocosCreatorStorage | null>(releasesUrl)
    ).result;

    if (!storage) {
        throw new Error('unable to get cocos creator releases');
    }

    return storage;
}
