import { expressjwt } from 'express-jwt'
import { config } from 'server/config'

export const userJwt = expressjwt({ secret: config.userJWTSecret, algorithms: ['HS512'] })
