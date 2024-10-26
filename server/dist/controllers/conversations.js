"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversation = exports.getConversations = void 0;
const tslib_1 = require("tslib");
const conversation_1 = tslib_1.__importDefault(require("../models/conversation"));
const successResponse_1 = tslib_1.__importDefault(require("../helpers/successResponse"));
const TryCatch_1 = require("../helpers/TryCatch");
const errorResponse_1 = require("../middleware/errorResponse");
function getConversations(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.body;
            const conversations = yield conversation_1.default.find({ organisation: id }).sort({
                _id: -1,
            });
            (0, successResponse_1.default)(res, conversations);
        }
        catch (error) {
            next(error);
        }
    });
}
exports.getConversations = getConversations;
exports.getConversation = (0, TryCatch_1.TryCatch)((req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    const conversation = yield conversation_1.default.findById(id)
        .populate('collaborators')
        .sort({ _id: -1 });
    if (!conversation) {
        return next(new errorResponse_1.ErrorHandler(404, 'Conversation not found'));
    }
    // const conversations = await Conversations.findById(id).populate(
    //   'collaborators'
    // )
    const collaborators = [...conversation.collaborators];
    // Find the index of the collaborator with the current user's ID
    const currentUserIndex = conversation.collaborators.findIndex((coworker) => coworker._id.toString() === req.user.id);
    //   // Remove the current user collaborator from the array
    conversation.collaborators.splice(currentUserIndex, 1);
    //   // Create the name field based on the other collaborator's username
    const name = ((_a = conversation.collaborators[0]) === null || _a === void 0 ? void 0 : _a.username) || conversation.name;
    (0, successResponse_1.default)(res, Object.assign(Object.assign({}, conversation.toObject()), { name,
        collaborators }));
}));
//# sourceMappingURL=conversations.js.map