import type { BigNumber } from 'bignumber.js'
import type { OpenMultiplyVaultStage } from 'features/multiply/open/pipes/openMultiplyVault.types'

export interface OpenMultiplyVaultStatusProps {
  stage: OpenMultiplyVaultStage
  id?: BigNumber
  etherscan?: string
  openTxHash?: string
}
