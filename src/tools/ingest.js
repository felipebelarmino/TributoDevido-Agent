"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var discoveryengine_1 = require("@google-cloud/discoveryengine");
var storage_1 = require("@google-cloud/storage");
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
// Configuration
var PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "td-multi-agent-faq-1";
var LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
var DATA_STORE_ID = process.env.VERTEX_SEARCH_DATA_STORE_ID;
// Bucket created automatically with suffix for uniqueness
var BUCKET_NAME = "td-kb-source-829114946536";
if (!DATA_STORE_ID) {
    console.error("Error: VERTEX_SEARCH_DATA_STORE_ID is not set in environment.");
    process.exit(1);
}
var storage = new storage_1.Storage({ projectId: PROJECT_ID });
var client = new discoveryengine_1.DocumentServiceClient();
function uploadToGCS(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var fileName, destination;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fileName = path.basename(filePath);
                    destination = "knowledge_base/".concat(Date.now(), "_").concat(fileName);
                    console.log("\u2601\uFE0F  Uploading '".concat(fileName, "' to gs://").concat(BUCKET_NAME, "/").concat(destination, "..."));
                    return [4 /*yield*/, storage.bucket(BUCKET_NAME).upload(filePath, {
                            destination: destination,
                        })];
                case 1:
                    _a.sent();
                    console.log("\u2705 Upload complete.");
                    return [2 /*return*/, "gs://".concat(BUCKET_NAME, "/").concat(destination)];
            }
        });
    });
}
function importToVertexAI(gcsUri) {
    return __awaiter(this, void 0, void 0, function () {
        var parent, request, operation, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83E\uDDE0 Importing ".concat(gcsUri, " into Data Store '").concat(DATA_STORE_ID, "'..."));
                    parent = client.projectLocationDataStoreBranchPath(PROJECT_ID, LOCATION, DATA_STORE_ID, "default_branch");
                    request = {
                        parent: parent,
                        gcsSource: {
                            inputUris: [gcsUri],
                            dataSchema: "content", // Indicates unstructured content (PDF, HTML)
                        },
                        reconciliationMode: "INCREMENTAL",
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.importDocuments(request)];
                case 2:
                    operation = (_a.sent())[0];
                    console.log("\u23F3 Operation started: ".concat(operation.name));
                    console.log("   This may take a few minutes. Check Vertex AI Console for status.");
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("❌ Error importing document:", error_1);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, gcsUri, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = process.argv[2];
                    if (!filePath) {
                        console.log("Usage: npx ts-node src/tools/ingest.ts <file-path>");
                        process.exit(1);
                    }
                    if (!fs.existsSync(filePath)) {
                        console.error("Error: File not found at ".concat(filePath));
                        process.exit(1);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, uploadToGCS(filePath)];
                case 2:
                    gcsUri = _a.sent();
                    return [4 /*yield*/, importToVertexAI(gcsUri)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error("Fatal Error:", err_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
main();
