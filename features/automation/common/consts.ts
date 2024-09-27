import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { AutomationFeatures, AutomationKinds } from 'features/automation/common/types'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import type { FixedSizeArray } from 'helpers/types'
import { one } from 'helpers/zero'

export const closeVaultOptions: FixedSizeArray<string, 2> = ['collateral', 'dai']

export const maxUint32 = new BigNumber('0xFFFFFFFF')
export const maxUint256 = new BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  16,
)

export const DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET = 0.2

// values in %
export const DEFAULT_AUTO_BS_MAX_SLIDER_VALUE = new BigNumber(500)
export const DEFAULT_DEVIATION = one
export const MIX_MAX_COL_RATIO_TRIGGER_OFFSET = new BigNumber(5)
export const NEXT_COLL_RATIO_OFFSET = new BigNumber(3)
export const DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE = new BigNumber(0.05)

export const DEFAULT_MAX_BASE_FEE_IN_GWEI = new BigNumber(300) // GWEI
export const MAX_DEBT_FOR_SETTING_STOP_LOSS = new BigNumber(20000000) // DAI
export const ACCEPTABLE_FEE_DIFF = new BigNumber(3) // $

export const progressStatuses = [
  TxStatus.WaitingForConfirmation,
  TxStatus.WaitingForApproval,
  TxStatus.Propagating,
]

export const failedStatuses = [TxStatus.Failure, TxStatus.CancelledByTheUser, TxStatus.Error]

export const sidebarAutomationFlowSuffix = {
  [AutomationFeatures.STOP_LOSS]: 'Sl',
  [AutomationFeatures.AUTO_SELL]: 'AutoSell',
  [AutomationFeatures.AUTO_BUY]: 'AutoBuy',
  [AutomationFeatures.AUTO_TAKE_PROFIT]: 'AutoTakeProfit',
  [AutomationFeatures.TRAILING_STOP_LOSS]: 'n/a',
  [AutomationFeatures.PARTIAL_TAKE_PROFIT]: 'n/a',
}

export const sidebarAutomationFeatureCopyMap = {
  [AutomationFeatures.STOP_LOSS]: 'protection.stop-loss-protection',
  [AutomationFeatures.AUTO_BUY]: 'auto-buy.title',
  [AutomationFeatures.AUTO_SELL]: 'auto-sell.title',
  [AutomationFeatures.AUTO_TAKE_PROFIT]: 'auto-take-profit.title',
  [AutomationFeatures.TRAILING_STOP_LOSS]: 'protection.trailing-stop-loss',
  [AutomationFeatures.PARTIAL_TAKE_PROFIT]: 'partial-take-profit.title',
}

export const sidebarAutomationLinkMap = {
  [AutomationFeatures.STOP_LOSS]: 'what-is-automated-stop-loss',
  [AutomationFeatures.AUTO_BUY]: 'setting-up-auto-buy-for-your-vault',
  [AutomationFeatures.AUTO_SELL]: 'setting-up-auto-sell-for-your-vault',
  [AutomationFeatures.AUTO_TAKE_PROFIT]: 'what-is-take-profit',
  [AutomationFeatures.TRAILING_STOP_LOSS]: 'n/a',
  [AutomationFeatures.PARTIAL_TAKE_PROFIT]: 'what-is-take-profit',
}

export const autoKindToCopyMap = {
  [AutomationKinds.STOP_LOSS]: 'protection.stop-loss-protection',
  [AutomationKinds.AUTO_BUY]: 'auto-buy.title',
  [AutomationKinds.AUTO_SELL]: 'auto-sell.title',
  [AutomationKinds.AUTO_TAKE_PROFIT]: 'auto-take-profit.title',
  [AutomationFeatures.TRAILING_STOP_LOSS]: 'n/a',
  [AutomationFeatures.PARTIAL_TAKE_PROFIT]: 'n/a',
}

export enum CloseVaultToEnum {
  DAI = 'dai',
  COLLATERAL = 'collateral',
}

export const protocolAutomations = {
  [VaultProtocol.Maker]: [
    AutomationFeatures.STOP_LOSS,
    AutomationFeatures.AUTO_SELL,
    AutomationFeatures.AUTO_BUY,
    AutomationFeatures.AUTO_TAKE_PROFIT,
  ],
  [VaultProtocol.Aave]: [
    AutomationFeatures.STOP_LOSS,
    AutomationFeatures.AUTO_BUY,
    AutomationFeatures.AUTO_SELL,
  ],
}

export const aaveTokenPairsAllowedAutomation = [
  ['CBETH', 'DAI'],
  ['CBETH', 'USDC'],
  ['ETH', 'DAI'],
  ['ETH', 'USDC'],
  ['ETH', 'USDBC'],
  ['LDO', 'USDT'],
  ['LINK', 'DAI'],
  ['LINK', 'USDC'],
  ['LINK', 'USDT'],
  ['MKR', 'DAI'],
  ['RETH', 'DAI'],
  ['RETH', 'USDC'],
  ['RETH', 'USDT'],
  ['SDAI', 'USDT'],
  ['USDC', 'USDT'],
  ['WBTC', 'DAI'],
  ['WBTC', 'USDC'],
  ['WBTC', 'USDT'],
  ['ETH', 'USDT'],
  ['WSTETH', 'DAI'],
  ['WSTETH', 'USDC'],
]

export const vaultIdsThatAutoBuyTriggerShouldBeRecreated = [
  10804, 29568, 29186, 30084, 29628, 29928, 29574, 29643,
]

export const faultyTakeProfitTriggerIdsByNetwork: Partial<Record<NetworkIds, number[]>> = {
  [NetworkIds.BASEMAINNET]: [
    10000000122, 10000000221, 10000000224, 10000000232, 10000000243, 10000000268, 10000000309,
    10000000335, 10000000348,
  ],
  [NetworkIds.MAINNET]: [
    10000000135, 10000000139, 10000000141, 10000000159, 10000000164, 10000000172, 10000000181,
    10000000201, 10000000208, 10000000239, 10000000253, 10000000255,
  ],
  [NetworkIds.OPTIMISMMAINNET]: [
    10000000168, 10000000167, 10000000163, 10000000161, 10000000149, 10000000143, 10000000141,
    10000000136, 10000000105, 10000000089, 10000000075,
  ],
  [NetworkIds.ARBITRUMMAINNET]: [
    10000000098, 10000000124, 10000000127, 10000000140, 10000000166, 10000000171, 10000000193,
    10000000194, 10000000200, 10000000208, 10000000214, 10000000231, 10000000239, 10000000244,
    10000000255,
  ],
}
