import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationFeatures } from 'features/automation/common/types'
import { FixedSizeArray } from 'helpers/types'
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
export const DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE = 0.05

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
