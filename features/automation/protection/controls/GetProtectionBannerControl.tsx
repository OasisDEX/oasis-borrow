import { getNetworkName } from '@oasisdex/web3-context'
import { BigNumber } from 'bignumber.js'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'

import { useAppContext } from '../../../../components/AppContextProvider'
import { VaultViewMode } from '../../../../components/VaultTabSwitch'
import { useObservable } from '../../../../helpers/observableHook'
import { useSessionStorage } from '../../../../helpers/useSessionStorage'
import { extractStopLossData } from '../common/StopLossTriggerDataExtractor'
import { TAB_CHANGE_SUBJECT } from '../common/UITypes/TabChange'

interface GetProtectionBannerProps {
  vaultId: BigNumber
  ilk: string
  debt: BigNumber
  token?: string
}

export function GetProtectionBannerControl({
  vaultId,
  token,
  ilk,
  debt,
}: GetProtectionBannerProps) {
  const { t } = useTranslation()
  const { uiChanges, automationTriggersData$ } = useAppContext()
  const [isBannerClosed, setIsBannerClosed] = useSessionStorage('overviewProtectionBanner', false)
  const autoTriggersData$ = automationTriggersData$(vaultId)
  const [automationTriggersData] = useObservable(autoTriggersData$)

  const isAllowedForAutomation = isSupportedAutomationIlk(getNetworkName(), ilk)
  const basicBSEnabled = useFeatureToggle('BasicBS')

  const slData = automationTriggersData ? extractStopLossData(automationTriggersData) : null

  const handleClose = useCallback(() => setIsBannerClosed(true), [])

  return !slData?.isStopLossEnabled &&
    !isBannerClosed &&
    isAllowedForAutomation &&
    !debt.isZero() ? (
    <>
      <Banner
        title={
          !basicBSEnabled
            ? t('vault-banners.setup-stop-loss.header')
            : t('vault-banners.get-protection.header')
        }
        description={
          !basicBSEnabled
            ? t('vault-banners.setup-stop-loss.content', { token })
            : t('vault-banners.get-protection.content', { token })
        }
        image={{
          src: '/static/img/setup-banner/stop-loss.svg',
          backgroundColor: bannerGradientPresets.stopLoss[0],
          backgroundColorEnd: bannerGradientPresets.stopLoss[1],
        }}
        button={{
          action: () => {
            uiChanges.publish(TAB_CHANGE_SUBJECT, {
              type: 'change-tab',
              currentMode: VaultViewMode.Protection,
            })
          },
          text: !basicBSEnabled
            ? t('vault-banners.setup-stop-loss.button')
            : t('vault-banners.get-protection.button'),
        }}
        close={handleClose}
      />
    </>
  ) : null
}
