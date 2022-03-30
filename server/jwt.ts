import jwt from 'express-jwt'

import { config } from './config'

export const userJwt = jwt({ secret: config.userJWTSecret, algorithms: ['HS512'] })
