"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({
    path: ".env"
});
const connectDb = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("Connected to database");
    }
    catch (error) {
        console.error("Error connecting to database", error);
    }
};
exports.connectDb = connectDb;
