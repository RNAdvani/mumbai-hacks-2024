"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const project_1 = require("../controllers/project");
const router = express_1.default.Router();
exports.projectRoutes = router;
router.post("/create", project_1.createProject);
router.get("/get/:id", project_1.getProjects);
//# sourceMappingURL=project.js.map