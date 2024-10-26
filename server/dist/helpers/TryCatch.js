"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TryCatch = void 0;
const TryCatch = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.TryCatch = TryCatch;
//# sourceMappingURL=TryCatch.js.map