"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    task: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
    },
    attachments: [String],
    mentions: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        }],
    parentComment: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Comment',
    },
    reactions: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
            },
            type: {
                type: String,
                enum: ['like', 'heart', 'smile', 'thumbsup'],
            },
        }],
    isEdited: {
        type: Boolean,
        default: false,
    },
    editHistory: [{
            content: String,
            editedAt: {
                type: Date,
                default: Date.now,
            },
        }],
}, {
    timestamps: true,
    versionKey: false,
});
// Middleware to update task when comment is added
commentSchema.post('save', function () {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const task = yield mongoose_1.default.model('Task').findById(this.task);
        if (task) {
            task.comments.push({
                user: this.user,
                content: this.content,
                createdAt: this.createdAt,
            });
            yield task.save();
        }
    });
});
exports.Comment = mongoose_1.default.model('Comment', commentSchema);
//# sourceMappingURL=comment.js.map