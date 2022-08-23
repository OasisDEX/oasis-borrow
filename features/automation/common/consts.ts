import BigNumber from 'bignumber.js'
import { one } from 'helpers/zero'

export const maxUint32 = new BigNumber('0xFFFFFFFF')
export const maxUint256 = new BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  16,
)

// values in %
export const DEFAULT_BASIC_BS_MAX_SLIDER_VALUE = new BigNumber(500)
export const DEFAULT_DEVIATION = one
export const MIX_MAX_COL_RATIO_TRIGGER_OFFSET = new BigNumber(5)
export const NEXT_COLL_RATIO_OFFSET = new BigNumber(3)

export const DEFAULT_MAX_BASE_FEE_IN_GWEI = new BigNumber(300) // GWEI
export const MAX_DEBT_FOR_SETTING_STOP_LOSS = new BigNumber(20000000) // DAI
export const ACCEPTABLE_FEE_DIFF = new BigNumber(3) // $

// TO BE REMOVED AS SOON AS THESE AUTO-SELL TRIGGERS WILL BE REPLACED
export const overrideWarningAutoSellTriggerIds = [352, 367]
