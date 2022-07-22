import { getNetworkName } from '@oasisdex/web3-context'
import { BigNumber } from 'bignumber.js'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React from 'react'

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
  const setHash = useHash()[1]
  const { automationTriggersData$ } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(vaultId)
  const [automationTriggersData] = useObservable(autoTriggersData$)

  const isAllowedForAutomation = isSupportedAutomationIlk(getNetworkName(), ilk)
  const basicBSEnabled = useFeatureToggle('BasicBS')

  const slData = automationTriggersData ? extractStopLossData(automationTriggersData) : null

  return !slData?.isStopLossEnabled && isAllowedForAutomation && !debt.isZero() ? (
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
          action: () => setHash(VaultViewMode.Protection),
          text: !basicBSEnabled
            ? t('vault-banners.setup-stop-loss.button')
            : t('vault-banners.get-protection.button'),
        }}
      />
    </>
  ) : null
}
