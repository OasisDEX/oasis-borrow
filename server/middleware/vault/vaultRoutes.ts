import { Handler, Router } from 'express'
import asyncHandler from 'express-async-handler'

import { createOrUpdate } from './createOrUpdate'

export function vaultRoutes(): Handler {
    return Router().post('/', asyncHandler(createOrUpdate))
}