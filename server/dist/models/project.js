"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const projectSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please enter project name'],
    },
    description: {
        type: String,
        required: [true, 'Please provide project description'],
    },
    manager: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    organisation: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Organisation',
        required: true,
    },
    status: {
        type: String,
        enum: ['planning', 'active', 'completed', 'on-hold'],
        default: 'planning',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    channel: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Channel',
    },
    tasks: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Task',
        }],
    team: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        }],
    budget: Number,
    tags: [String],
    attachments: [String],
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
}, {
    timestamps: true,
    versionKey: false,
});
projectSchema.pre('save', function (next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            const channel = yield mongoose_1.default.model('Channel').create({
                name: `project-${this.name.toLowerCase().replace(/\s+/g, '-')}`,
                collaborators: [this.manager, ...this.team],
                title: `Project Channel: ${this.name}`,
                description: this.description,
                organisation: this.organisation,
                isChannel: true,
            });
            this.channel = channel._id;
        }
        next();
    });
});
exports.Project = mongoose_1.default.model('Project', projectSchema);
//# sourceMappingURL=project.js.map