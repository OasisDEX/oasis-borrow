import { Handler, Router } from 'express'
import asyncHandler from 'express-async-handler'

import { get } from './get'
import { sign } from './sign'

export function tosRoutes(): Handler {
  return Router().get('/:version', asyncHandler(get)).post('/', asyncHandler(sign))
}
