import { BigNumber } from 'bignumber.js'
import React, { useCallback } from 'react'

import { useSessionStorage } from '../../../helpers/useSessionStorage'
import { StopLossTriggeredBannerLayout } from './StopLossTriggeredBannerLayout'

export const mockTriggeredEvent = {
  kind: 'STOPLOSS-TRIGGERED',
  daiAmount: new BigNumber(5000.34),
  collateralAmount: new BigNumber(4),
  oraclePrice: new BigNumber(2424.64),
  gasFee: new BigNumber(200),
  timestamp: '2022-02-11T10:09:02+00:00',
  token: 'ETH',
  slippage: new BigNumber(2),
  triggerType: 1,
}

export function StopLossTriggeredBannerControl() {
  const [isBannerClosed, setIsBannerClosed] = useSessionStorage('stopLossTriggeredBanner', false)
  const handleClose = useCallback(() => setIsBannerClosed(true), [])

  return !isBannerClosed ? <StopLossTriggeredBannerLayout handleClose={handleClose} /> : null
}
