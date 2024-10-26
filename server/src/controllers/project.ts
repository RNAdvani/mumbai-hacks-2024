import successResponse from '../helpers/successResponse'
import { TryCatch } from '../helpers/TryCatch'
import { ErrorHandler } from '../middleware/errorResponse'
import organisation from '../models/organisation'
import { Project as ProjectSchema } from '../models/project'
import { User } from '../types'

export const createProject = TryCatch(async (req, res, next) => {
  const {
    organisationId,
    assignedEmployees,
    name,
    description,
    priority,
    status,
    startDate,
    endDate,
  } = req.body
  const Organisation = await organisation
    .findById(organisationId)
    .populate('owner')
  if (!Organisation) {
    return next(new ErrorHandler(404, 'Organisation not found'))
  }
  const team = assignedEmployees.map((employee: User) => employee._id)
  const owner = Organisation.owner as User
  const project = new ProjectSchema({
    name,
    description,
    manager: owner._id,
    team: team,
    organisation: Organisation._id,
    priority,
    status,
    startDate,
    endDate,
  })
  await project.save()
  successResponse(res, project)
})

export const getProjects = TryCatch(async (req, res, next) => {
  const { organisationId } = req.body
  console.log(organisationId)
  //   const Organisation = await organisation.findById(organisationId)
  //   console.log(Organisation)
  if (!organisationId) {
    return next(new ErrorHandler(404, 'Organisation not found'))
  }
  const projects = await ProjectSchema.find({ organisation: organisationId })
    .populate('team')
    .populate('manager')
  successResponse(res, projects)
})
