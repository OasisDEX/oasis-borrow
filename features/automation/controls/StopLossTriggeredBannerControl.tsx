import React, { useCallback } from 'react'

import { useSessionStorage } from '../../../helpers/useSessionStorage'
import { StopLossTriggeredBannerLayout } from './StopLossTriggeredBannerLayout'

export function StopLossTriggeredBannerControl() {
  const [isBannerClosed, setIsBannerClosed] = useSessionStorage('stopLossTriggeredBanner', false)
  const handleClose = useCallback(() => setIsBannerClosed(true), [])

  return !isBannerClosed ? <StopLossTriggeredBannerLayout handleClose={handleClose} /> : null
}
