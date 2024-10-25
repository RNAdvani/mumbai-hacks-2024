"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const organisationSchema = new mongoose_1.default.Schema({
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
    },
    coWorkers: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    departments: [String],
    managers: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        }],
    projects: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Project',
        }],
    settings: {
        allowEmployeeTaskCreation: {
            type: Boolean,
            default: true,
        },
        defaultTaskChannel: {
            type: Boolean,
            default: true,
        },
        notificationPreferences: {
            taskAssignment: {
                type: Boolean,
                default: true,
            },
            taskStatusChange: {
                type: Boolean,
                default: true,
            },
            projectUpdates: {
                type: Boolean,
                default: true,
            },
        },
    },
    joinLink: String,
    url: String,
}, {
    timestamps: true,
    versionKey: false,
});
// Generate orgnaisation join link
organisationSchema.methods.generateJoinLink = function () {
    const url = process.env.NODE_ENV === 'development'
        ? process.env.STAGING_URL
        : process.env.PRODUCTION_URL;
    this.joinLink = `${url}/${this._id}`;
    this.url = `${url}/${this.name}`;
};
exports.default = mongoose_1.default.model('Organisation', organisationSchema);
//# sourceMappingURL=organisation.js.map