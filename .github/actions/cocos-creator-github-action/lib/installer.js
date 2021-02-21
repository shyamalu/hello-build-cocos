"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCocosCreator = exports.COCOS_CREATOR = void 0;
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const tc = __importStar(require("@actions/tool-cache"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const helper = __importStar(require("./helper"));
exports.COCOS_CREATOR = 'cocos-creator';
function getCocosCreator(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const platform = helper.getPlatform();
        const { version: selected, downloadUrl, } = yield helper.decideCocosVersion(version, platform);
        let toolPath = tc.find(exports.COCOS_CREATOR, version);
        if (toolPath) {
            core.debug(`Tool found in cache ${toolPath}`);
        }
        else {
            core.debug(`Downloading Cocos Creator from url ${downloadUrl}`);
            const sdkFile = yield tc.downloadTool(downloadUrl);
            const sdkCache = yield tmpDir(platform);
            const sdkDir = yield extract(sdkFile, sdkCache, path.basename(downloadUrl));
            toolPath = yield tc.cacheDir(sdkDir, exports.COCOS_CREATOR, version);
        }
        core.exportVariable('COCOS_CREATOR_ROOT', toolPath);
        core.addPath(path.join(toolPath, 'bin'));
        core.addPath(path.join(toolPath, 'bin', 'cache'));
    });
}
exports.getCocosCreator = getCocosCreator;
function tmpDir(platform) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseDir = tmpBaseDir(platform);
        const tempDir = path.join(baseDir, 'temp_' + Math.floor(Math.random() * 2000000000));
        yield io.mkdirP(tempDir);
        return tempDir;
    });
}
function tmpBaseDir(platform) {
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
function extract(sdkFile, sdkCache, originalFilename) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileStats = fs.statSync(path.normalize(sdkFile));
        if (fileStats.isFile()) {
            const stats = fs.statSync(sdkFile);
            if (!stats) {
                throw new Error(`Failed to extract ${sdkFile} - it doesn't exist`);
            }
            else if (stats.isDirectory()) {
                throw new Error(`Failed to extract ${sdkFile} - it is a directory`);
            }
            if (originalFilename.endsWith('tar.xz')) {
                yield tc.extractTar(sdkFile, sdkCache, 'x');
            }
            else {
                yield tc.extractZip(sdkFile, sdkCache);
            }
            return path.join(sdkCache, fs.readdirSync(sdkCache)[0]);
        }
        else {
            throw new Error(`Cocos Creator ${sdkFile} is not a file`);
        }
    });
}
