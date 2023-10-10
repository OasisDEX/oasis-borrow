import type { BigNumber } from 'bignumber.js'
import type { IlkData } from 'blockchain/ilks.types'
import type { Vault } from 'blockchain/vaults.types'
import type { Quote } from 'features/exchange/exchange'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'

export interface ManageVaultEnvironment {
  account?: string
  accountIsController: boolean
  proxyAddress?: string
  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  priceInfo: PriceInfo
  quote?: Quote
  swap?: Quote
  exchangeError: boolean
  slippage: BigNumber
  vaultHistory: VaultHistoryEvent[]
  vaultType: VaultType
}
