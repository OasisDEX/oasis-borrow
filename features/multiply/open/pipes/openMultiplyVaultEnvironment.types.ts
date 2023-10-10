import type { IlkDataChange } from 'blockchain/ilks.types'
import type { BalanceInfoChange } from 'features/shared/balanceInfo.types'
import type { PriceInfoChange } from 'features/shared/priceInfo.types'
import type { SlippageChange } from 'features/userSettings/userSettings.types'

export type OpenVaultEnvironmentChange =
  | PriceInfoChange
  | BalanceInfoChange
  | IlkDataChange
  | SlippageChange
