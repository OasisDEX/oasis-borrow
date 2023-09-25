import { zero } from 'helpers/zero'

import type { OpenVaultSummary } from './openVaultSummary.types'

export const defaultOpenVaultSummary: OpenVaultSummary = {
  collateralBalance: zero,
  afterCollateralBalance: zero,
}
