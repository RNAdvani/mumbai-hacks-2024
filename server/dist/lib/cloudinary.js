"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOnCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const uploadOnCloudinary = async (filepath) => {
    try {
        if (!filepath)
            return null;
        const res = await cloudinary_1.v2.uploader.upload(filepath, {
            resource_type: 'auto'
        });
        fs_1.default.unlinkSync;
        return res;
    }
    catch (error) {
        console.log(error);
        fs_1.default.unlinkSync;
        return null;
    }
};
exports.uploadOnCloudinary = uploadOnCloudinary;
