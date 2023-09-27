import { trackingEvents } from 'analytics/trackingEvents'
import {
  MixpanelAutomationEventIds,
  MixpanelCommonAnalyticsSections,
  MixpanelPages,
} from 'analytics/types'
import type { BigNumber } from 'bignumber.js'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import { useAutomationContext } from 'components/context'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
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
    environmentData: { chainId },
  } = useAutomationContext()

  const isAllowedForAutomation = isSupportedAutomationIlk(chainId, ilk)

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
              MixpanelAutomationEventIds.SelectStopLoss,
              MixpanelPages.VaultsOverview,
              MixpanelCommonAnalyticsSections.Banner,
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
