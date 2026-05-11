import env from '../config/env.js'
import { forwardJson } from '../services/proxyService.js'

const taskUrl = (path = '') => `${env.modelServiceUrl}/internal/tasks${path}`

export const listTasks = (req, res, next) =>
  forwardJson({ url: taskUrl(), req, res, method: 'GET', includeUserContext: true }).catch(next)

export const recommendTask = (req, res, next) =>
  forwardJson({ url: taskUrl('/recommend'), req, res, body: req.body, includeUserContext: true }).catch(next)

export const assignTask = (req, res, next) =>
  forwardJson({ url: taskUrl('/assign'), req, res, body: req.body, includeUserContext: true }).catch(next)
