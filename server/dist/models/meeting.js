"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const meetingSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: [true, 'Please provide meeting title'],
    },
    description: String,
    organizer: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    organisation: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Organisation',
        required: true,
    },
    participants: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
            },
            joinedAt: Date,
            leftAt: Date,
        },
    ],
    scheduledStartTime: {
        type: Date,
        required: true,
    },
    scheduledEndTime: {
        type: Date,
        required: true,
    },
    actualStartTime: Date,
    actualEndTime: Date,
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled',
    },
    recording: {
        url: String,
        startedAt: Date,
        endedAt: Date,
    },
    meetingMinutes: {
        text: String,
        generatedAt: Date,
    },
    zegoToken: String,
    roomId: {
        type: String,
        unique: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.default = mongoose_1.default.model('Meeting', meetingSchema);
//# sourceMappingURL=meeting.js.map