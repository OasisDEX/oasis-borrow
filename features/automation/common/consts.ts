import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
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
  [AutomationFeatures.CONSTANT_MULTIPLE]: 'ConstantMultiple',
  [AutomationFeatures.AUTO_TAKE_PROFIT]: 'AutoTakeProfit',
}

export const sidebarAutomationFeatureCopyMap = {
  [AutomationFeatures.STOP_LOSS]: 'protection.stop-loss-protection',
  [AutomationFeatures.AUTO_BUY]: 'auto-buy.title',
  [AutomationFeatures.AUTO_SELL]: 'auto-sell.title',
  [AutomationFeatures.CONSTANT_MULTIPLE]: 'constant-multiple.title',
  [AutomationFeatures.AUTO_TAKE_PROFIT]: 'auto-take-profit.title',
}

export const sidebarAutomationLinkMap = {
  [AutomationFeatures.STOP_LOSS]: 'what-is-automated-stop-loss',
  [AutomationFeatures.AUTO_BUY]: 'setting-up-auto-buy-for-your-vault',
  [AutomationFeatures.AUTO_SELL]: 'setting-up-auto-sell-for-your-vault',
  [AutomationFeatures.CONSTANT_MULTIPLE]: 'what-is-constant-multiple',
  [AutomationFeatures.AUTO_TAKE_PROFIT]: 'what-is-take-profit',
}

export const autoKindToCopyMap = {
  [AutomationKinds.STOP_LOSS]: 'protection.stop-loss-protection',
  [AutomationKinds.AUTO_BUY]: 'auto-buy.title',
  [AutomationKinds.AUTO_SELL]: 'auto-sell.title',
  [AutomationKinds.AUTO_TAKE_PROFIT]: 'auto-take-profit.title',
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
    AutomationFeatures.CONSTANT_MULTIPLE,
    AutomationFeatures.AUTO_TAKE_PROFIT,
  ],
  [VaultProtocol.Aave]: [
    AutomationFeatures.STOP_LOSS,
    AutomationFeatures.AUTO_BUY,
    AutomationFeatures.AUTO_SELL,
  ],
}

export const aaveTokenPairsAllowedAutomation = [
  ['ETH', 'USDC'],
  ['WBTC', 'USDC'],
  ['WSTETH', 'USDC'],
  ['RETH', 'USDC'],
  ['CBETH', 'USDC'],
  ['ETH', 'DAI'],
  ['WBTC', 'DAI'],
  ['WSTETH', 'DAI'],
  ['RETH', 'DAI'],
  ['CBETH', 'DAI'],
]

export const vaultIdsThatAutoBuyTriggerShouldBeRecreated = [
  10804, 29568, 29186, 30084, 29628, 29928, 29574, 29643,
]
