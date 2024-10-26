"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRoutes = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const tasks_1 = require("../controllers/tasks");
const protect_1 = require("../middleware/protect");
const router = express_1.default.Router();
exports.taskRoutes = router;
router.post('/create', protect_1.protect, tasks_1.createTask);
router.post("/get", protect_1.protect, tasks_1.getTasks);
router.post("/update", protect_1.protect, tasks_1.updateTask);
//# sourceMappingURL=tasks.js.map