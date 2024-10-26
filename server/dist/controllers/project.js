"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjects = exports.createProject = void 0;
const tslib_1 = require("tslib");
const successResponse_1 = tslib_1.__importDefault(require("../helpers/successResponse"));
const TryCatch_1 = require("../helpers/TryCatch");
const errorResponse_1 = require("../middleware/errorResponse");
const organisation_1 = tslib_1.__importDefault(require("../models/organisation"));
const project_1 = require("../models/project");
exports.createProject = (0, TryCatch_1.TryCatch)((req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { organisationId, assignedEmployees, name, description, priority, status, startDate, endDate, } = req.body;
    const Organisation = yield organisation_1.default
        .findById(organisationId)
        .populate('owner');
    if (!Organisation) {
        return next(new errorResponse_1.ErrorHandler(404, 'Organisation not found'));
    }
    const team = assignedEmployees.map((employee) => employee._id);
    const owner = Organisation.owner;
    const project = new project_1.Project({
        name,
        description,
        manager: owner._id,
        team: team,
        organisation: Organisation._id,
        priority,
        status,
        startDate,
        endDate,
    });
    yield project.save();
    (0, successResponse_1.default)(res, project);
}));
exports.getProjects = (0, TryCatch_1.TryCatch)((req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const organisationId = req.params.id;
    console.log(organisationId);
    //   const Organisation = await organisation.findById(organisationId)
    //   console.log(Organisation)
    if (!organisationId) {
        return next(new errorResponse_1.ErrorHandler(404, 'Organisation not found'));
    }
    const projects = yield project_1.Project.find({ organisation: organisationId })
        .populate('team')
        .populate('manager');
    (0, successResponse_1.default)(res, projects);
}));
//# sourceMappingURL=project.js.map