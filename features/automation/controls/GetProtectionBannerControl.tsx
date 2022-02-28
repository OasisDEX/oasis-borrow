import { BigNumber } from 'bignumber.js'
import React, { useCallback } from 'react'

import { useAppContext } from '../../../components/AppContextProvider'
import { VaultViewMode } from '../../../components/TabSwitchLayout'
import { useObservable } from '../../../helpers/observableHook'
import { useSessionStorage } from '../../../helpers/useSessionStorage'
import { extractStopLossData } from '../common/StopLossTriggerDataExtractor'
import { TAB_CHANGE_SUBJECT } from '../common/UITypes/TabChange'
import { GetProtectionBannerLayout } from './GetProtectionBannerLayout'

interface GetProtectionBannerProps {
  vaultId: BigNumber
}

export function GetProtectionBannerControl({ vaultId }: GetProtectionBannerProps) {
  const { uiChanges, automationTriggersData$ } = useAppContext()
  const [isBannerClosed, setIsBannerClosed] = useSessionStorage('overviewProtectionBanner', false)
  const autoTriggersData$ = automationTriggersData$(vaultId)
  const automationTriggersData = useObservable(autoTriggersData$)

  const slData = automationTriggersData ? extractStopLossData(automationTriggersData) : null

  const handleClose = useCallback(() => setIsBannerClosed(true), [])

  return !slData?.isStopLossEnabled && !isBannerClosed ? (
    <GetProtectionBannerLayout
      handleClick={() => {
        uiChanges.publish(TAB_CHANGE_SUBJECT, { currentMode: VaultViewMode.Protection })
      }}
      handleClose={handleClose}
    />
  ) : null
}
