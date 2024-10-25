"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_routes_1 = require("./routes/user.routes");
const ErrorHandler_1 = require("./lib/ErrorHandler");
const db_1 = require("./lib/db");
const morgan_1 = __importDefault(require("morgan"));
dotenv_1.default.config({
    path: '.env',
});
const PORT = process.env.PORT;
const app = (0, express_1.default)();
app.use(express_1.default.json());
(0, db_1.connectDb)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000 '],
}));
app.use('/api/v1/users', user_routes_1.userRoutes);
app.use((0, morgan_1.default)('dev'));
app.use(ErrorHandler_1.errorMiddleware);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
