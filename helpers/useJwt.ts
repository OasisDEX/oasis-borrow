import jwt from 'express-jwt'

import { config } from '../server/config'

export const userJwt = jwt({ secret: config.userJWTSecret, algorithms: ['HS512'] })
