"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.verifyToken = exports.generateToken = void 0;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const generateToken = (appId, serverSecret, roomId, userId, effectiveTimeInSeconds = 3600, payload = '') => {
    // Current timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000);
    // Token will be valid starting from 30 minutes ago
    const createTime = currentTimestamp - 30 * 60;
    // Token expiration time
    const expireTime = createTime + effectiveTimeInSeconds;
    // Random number between 100000000 and 999999999
    const nonce = Math.floor(Math.random() * 900000000) + 100000000;
    // Create token info object
    const tokenInfo = {
        app_id: parseInt(appId, 10),
        user_id: userId.toString(),
        room_id: roomId,
        action: 1, // 1 means privileged user who can publish and play streams
        privilege: {
            1: 1, // Login room permission
            2: 1, // Publishing stream permission
        },
        stream_id_list: null,
        create_time: createTime,
        expire_time: expireTime,
        nonce,
        payload,
    };
    // Convert payload to Base64 if provided
    if (payload) {
        tokenInfo.payload = Buffer.from(payload).toString('base64');
    }
    // Convert token info to string
    const stringToSign = JSON.stringify(tokenInfo);
    // Create HMAC-SHA256 signature
    const signature = crypto_1.default
        .createHmac('sha256', serverSecret)
        .update(stringToSign)
        .digest('base64');
    // Combine components and encode
    const finalToken = Buffer.from(JSON.stringify({
        token_info: tokenInfo,
        key: serverSecret.substring(0, 8),
        signature,
    })).toString('base64');
    return finalToken;
};
exports.generateToken = generateToken;
const verifyToken = (token, serverSecret) => {
    try {
        // Decode token
        const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
        // Get token info and signature
        const { token_info, signature } = decodedToken;
        // Verify signature
        const calculatedSignature = crypto_1.default
            .createHmac('sha256', serverSecret)
            .update(JSON.stringify(token_info))
            .digest('base64');
        // Check if signatures match
        if (signature !== calculatedSignature) {
            return false;
        }
        // Check if token has expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > token_info.expire_time) {
            return false;
        }
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.verifyToken = verifyToken;
const decodeToken = (token) => {
    try {
        const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
        // If payload exists, decode it
        if (decodedToken.token_info.payload) {
            decodedToken.token_info.payload = Buffer.from(decodedToken.token_info.payload, 'base64').toString();
        }
        return decodedToken;
    }
    catch (error) {
        return null;
    }
};
exports.decodeToken = decodeToken;
//# sourceMappingURL=zegoToken.js.map