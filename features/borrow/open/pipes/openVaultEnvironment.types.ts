import type { IlkDataChange } from 'blockchain/ilks.types'
import type { BalanceInfoChange } from 'features/shared/balanceInfo.types'
import type { PriceInfoChange } from 'features/shared/priceInfo.types'

export type OpenVaultEnvironmentChange = PriceInfoChange | BalanceInfoChange | IlkDataChange
