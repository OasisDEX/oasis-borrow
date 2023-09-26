import { zero } from 'helpers/zero'

import type { OpenVaultSummary } from './openMultiplyVaultSummary.types'

export const defaultOpenVaultSummary: OpenVaultSummary = {
  collateralBalance: zero,
  afterCollateralBalance: zero,
}
