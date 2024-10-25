"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const body_parser_1 = __importDefault(require("body-parser"));
const router = express_1.default.Router();
exports.userRoutes = router;
router.post("/create", body_parser_1.default.raw({ type: 'application/json' }), user_controller_1.createUser);
