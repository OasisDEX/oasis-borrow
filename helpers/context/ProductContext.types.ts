import type { setupProductContext } from './ProductContext'
import type { DepreciatedServices } from './types'

export type ProductContext = ReturnType<typeof setupProductContext> & DepreciatedServices
