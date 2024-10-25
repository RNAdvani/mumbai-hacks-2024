"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const nodemailer_1 = tslib_1.__importDefault(require("nodemailer"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config({
    path: '.env',
});
function sendEmail(to, subject, html, text) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USERNAME,
                    pass: process.env.SMTP_PASSWORD,
                },
            });
            yield transporter.sendMail({
                from: process.env.SMTP_USERNAME,
                to,
                subject,
                html,
                text,
            });
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.default = sendEmail;
//# sourceMappingURL=sendEmail.js.map