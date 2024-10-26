"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endMeeting = exports.startRecording = exports.joinMeeting = exports.createMeeting = void 0;
const tslib_1 = require("tslib");
const user_1 = tslib_1.__importDefault(require("../models/user"));
const organisation_1 = tslib_1.__importDefault(require("../models/organisation"));
const zegoToken_1 = require("../helpers/zegoToken");
const meeting_1 = tslib_1.__importDefault(require("../models/meeting"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const TryCatch_1 = require("../helpers/TryCatch");
const errorResponse_1 = require("../middleware/errorResponse");
exports.createMeeting = (0, TryCatch_1.TryCatch)((req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { title, description, scheduledStartTime, scheduledEndTime, participantIds, } = req.body;
    // Check if user is a manager
    const user = yield user_1.default.findById(req.user.id);
    const org = yield organisation_1.default.findOne({
        $or: [{ owner: req.user.id }, { managers: req.user.id }],
    });
    if (!org || (user.role !== 'manager' && user.role !== 'owner')) {
        return next(new errorResponse_1.ErrorHandler(403, 'You are not authorized to create a meeting'));
    }
    // Generate unique room ID
    const roomId = `${org._id}-${Date.now()}`;
    // Generate ZEGO token
    const token = (0, zegoToken_1.generateToken)(process.env.ZEGO_APP_ID, process.env.ZEGO_SERVER_SECRET, roomId, req.user.id);
    const meeting = yield meeting_1.default.create({
        title,
        description,
        organizer: req.user.id,
        organisation: org._id,
        participants: participantIds.map((id) => ({ user: id })),
        scheduledStartTime,
        scheduledEndTime,
        zegoToken: token,
        roomId,
    });
    res.status(201).json({
        success: true,
        data: meeting,
    });
}));
exports.joinMeeting = (0, TryCatch_1.TryCatch)((req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { meetingId } = req.params;
    const meeting = yield meeting_1.default.findById(meetingId);
    if (!meeting) {
        return next(new errorResponse_1.ErrorHandler(404, 'Meeting not found'));
    }
    // Check if user is part of the organization
    const org = yield organisation_1.default.findById(meeting.organisation);
    if (!org.coWorkers.includes(req.user.id) &&
        !org.managers.includes(req.user.id) &&
        org.owner.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to join this meeting',
        });
    }
    // Generate participant token
    const participantToken = (0, zegoToken_1.generateToken)(process.env.ZEGO_APP_ID, process.env.ZEGO_SERVER_SECRET, meeting.roomId, req.user.id);
    // Update participant join time
    yield meeting_1.default.findByIdAndUpdate(meetingId, {
        $push: {
            participants: {
                user: req.user.id,
                joinedAt: new Date(),
            },
        },
    });
    res.status(200).json({
        success: true,
        data: {
            roomId: meeting.roomId,
            token: participantToken,
        },
    });
}));
exports.startRecording = (0, TryCatch_1.TryCatch)((req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { meetingId } = req.params;
    const meeting = yield meeting_1.default.findById(meetingId);
    if (!meeting) {
        return next(new errorResponse_1.ErrorHandler(404, 'Meeting not found'));
    }
    // Check if the user is authorized to start recording
    if (meeting.organizer.toString() !== req.user.id) {
        return next(new errorResponse_1.ErrorHandler(403, 'Only meeting organizer can start recording'));
    }
    // API request to start recording
    const response = yield axios_1.default.post('https://cloudrecord-api.zego.im/?Action=StartRecord', {
        room_id: meeting.roomId,
    });
    const recordingId = response.data['Data']['TaskID'];
    if (!recordingId) {
        return next(new errorResponse_1.ErrorHandler(500, 'Failed to start recording'));
    }
    yield meeting_1.default.findByIdAndUpdate(meetingId, {
        'recording.startedAt': new Date(),
        'recording.id': recordingId,
    });
    res.status(200).json({
        success: true,
        message: 'Recording started',
        recordingId,
    });
}));
exports.endMeeting = (0, TryCatch_1.TryCatch)((req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { meetingId } = req.params;
    const meeting = yield meeting_1.default.findById(meetingId);
    if (!meeting) {
        return next(new errorResponse_1.ErrorHandler(404, 'Meeting not found'));
    }
    if (meeting.organizer.toString() !== req.user.id) {
        return next(new errorResponse_1.ErrorHandler(403, 'Only meeting organizer can end the meeting'));
    }
    let recordingUrl = null;
    if ((_a = meeting.recording) === null || _a === void 0 ? void 0 : _a.url) {
        // API request to stop recording
        const response = yield axios_1.default.post('https://cloudrecord-api.zego.im/?Action=StopRecord', {
            room_id: meeting.roomId,
            recording_id: meeting.recording.url,
        });
        // Check if the recording URL is available
        recordingUrl = (_b = response.data) === null || _b === void 0 ? void 0 : _b.file_url;
        if (!recordingUrl) {
            return next(new errorResponse_1.ErrorHandler(500, 'Failed to retrieve recording URL'));
        }
        yield meeting_1.default.findByIdAndUpdate(meetingId, {
            status: 'completed',
            actualEndTime: new Date(),
            'recording.endedAt': new Date(),
            'recording.url': recordingUrl,
        });
    }
    res.status(200).json({
        success: true,
        message: 'Meeting ended successfully',
        recordingUrl,
    });
}));
//# sourceMappingURL=meeting.js.map