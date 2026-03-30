"use strict";
/**
 * models/codeSnapshot.model.ts
 *
 * Mongoose model for code snapshots taken during an interview session.
 *
 * Snapshots are captured in two ways:
 *  - 'auto'   : triggered by the editor on a configurable interval
 *  - 'manual' : triggered when the user explicitly runs the code (execute endpoint)
 *
 * When a snapshot is created via the execution endpoint, the `executionResult`
 * sub-document is populated with Judge0 output so the interviewer can review
 * both the code and its runtime output in the feedback view.
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeSnapshot = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const codeSnapshotSchema = new mongoose_1.Schema({
    room: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    session: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InterviewSession', required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    triggeredBy: {
        type: String,
        enum: ['auto', 'manual'],
        default: 'auto',
    },
    savedAt: { type: Date, default: Date.now, index: true },
    executionResult: {
        stdout: { type: String },
        stderr: { type: String },
        time: { type: String },
        memory: { type: Number },
    },
}, {
    timestamps: true,
});
exports.CodeSnapshot = mongoose_1.default.model('CodeSnapshot', codeSnapshotSchema);
