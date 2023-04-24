import { expressjwt } from 'express-jwt'

import { config } from './config'

export const userJwt = expressjwt({ secret: config.userJWTSecret, algorithms: ['HS512'] })
