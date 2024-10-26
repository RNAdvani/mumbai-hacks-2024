"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const protect_1 = require("../middleware/protect");
const meeting_1 = require("../controllers/meeting");
const router = express_1.default.Router();
router.post('/', protect_1.protect, meeting_1.createMeeting);
router.post('/:meetingId/join', protect_1.protect, meeting_1.joinMeeting);
router.post('/:meetingId/record', protect_1.protect, meeting_1.startRecording);
router.post('/:meetingId/end', protect_1.protect, meeting_1.endMeeting);
exports.default = router;
//# sourceMappingURL=meeting.js.map