import BigNumber from 'bignumber.js'

export const DEFAULT_SL_SLIDER_BOUNDARY = new BigNumber(0.05)
export const MAX_SL_SLIDER_VALUE_OFFSET = new BigNumber(0.03)
export const MAX_DEBT_FOR_SETTING_STOP_LOSS = new BigNumber(20000000)

export const DEFAULT_BASIC_BS_MAX_SLIDER_VALUE = new BigNumber(5)

// TO BE REMOVED AS SOON AS THESE AUTO-SELL TRIGGERS WILL BE REPLACED
export const overrideWarningAutoSellTriggerIds = [352, 367]
