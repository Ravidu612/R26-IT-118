import env from '../config/env.js'
import { forwardJson } from '../services/proxyService.js'

const authUrl = (path) => `${env.authServiceUrl}/internal/auth${path}`

export const register = (req, res, next) =>
  forwardJson({
    url: authUrl('/register'),
    req,
    res,
    body: req.body,
  }).catch(next)

export const login = (req, res, next) =>
  forwardJson({
    url: authUrl('/login'),
    req,
    res,
    body: req.body,
  }).catch(next)

export const refresh = (req, res, next) => forwardJson({ url: authUrl('/refresh'), req, res, body: {} }).catch(next)

export const logout = (req, res, next) => forwardJson({ url: authUrl('/logout'), req, res }).catch(next)

export const me = (req, res, next) => forwardJson({ url: authUrl('/me'), req, res, method: 'GET' }).catch(next)
