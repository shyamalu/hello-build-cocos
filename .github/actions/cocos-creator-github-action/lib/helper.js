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
exports.decideCocosVersion = exports.getPlatform = exports.releaseUrl = void 0;
const httpm = __importStar(require("@actions/http-client"));
exports.releaseUrl = 'https://creator-api.cocos.com/api/cocoshub/editor_version_list';
function getPlatform() {
    const platform = process.platform;
    if (platform == 'win32') {
        return 'win32';
    }
    if (platform == 'darwin') {
        return 'darwin';
    }
    return platform;
}
exports.getPlatform = getPlatform;
function decideCocosVersion(version, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        const storage = yield getReleases();
        return getVersion(storage, version, platform);
    });
}
exports.decideCocosVersion = decideCocosVersion;
function getVersion(storage, version, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        let release = storage.data["2d"].find(release => {
            storage.data["2d"].find(r => r.version === version);
        });
        if (!release) {
            release = storage.data["2d"][0];
        }
        const cocosData = {
            version: release.version,
            // @ts-ignore
            downloadUrl: release[platform]
        };
        return cocosData;
    });
}
function getReleases() {
    return __awaiter(this, void 0, void 0, function* () {
        const releasesUrl = `${exports.releaseUrl}`;
        const http = new httpm.HttpClient('cosos-creator-github-action');
        const storage = (yield http.getJson(releasesUrl)).result;
        if (!storage) {
            throw new Error('unable to get cocos creator releases');
        }
        return storage;
    });
}
