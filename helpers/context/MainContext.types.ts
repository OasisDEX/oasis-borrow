import type { setupMainContext } from './MainContext'
import type { DepreciatedServices } from './types'

export type MainContext = ReturnType<typeof setupMainContext> & DepreciatedServices
