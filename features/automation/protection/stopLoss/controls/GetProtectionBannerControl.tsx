import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
import { BigNumber } from 'bignumber.js'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { getNetworkName } from 'features/web3Context'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface GetProtectionBannerProps {
  ilk: string
  vaultId: BigNumber
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
  const setHash = useHash()[1]
  const {
    triggerData: { stopLossTriggerData },
  } = useAutomationContext()

  const isAllowedForAutomation = isSupportedAutomationIlk(getNetworkName(), ilk)

  return !stopLossTriggerData.isStopLossEnabled && isAllowedForAutomation && !debt.isZero() ? (
    <>
      <Banner
        title={t('vault-banners.get-protection.header')}
        description={t('vault-banners.get-protection.content', { token })}
        image={{
          src: '/static/img/setup-banner/stop-loss.svg',
          backgroundColor: bannerGradientPresets.stopLoss[0],
          backgroundColorEnd: bannerGradientPresets.stopLoss[1],
        }}
        button={{
          action: () => {
            trackingEvents.automation.buttonClick(
              AutomationEventIds.SelectStopLoss,
              Pages.VaultsOverview,
              CommonAnalyticsSections.Banner,
              { vaultId: vaultId.toString(), ilk },
            )
            setHash(VaultViewMode.Protection)
          },
          text: t('vault-banners.get-protection.button'),
        }}
      />
    </>
  ) : null
}
