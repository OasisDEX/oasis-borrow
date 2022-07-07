import { getNetworkName } from '@oasisdex/web3-context'
import { BigNumber } from 'bignumber.js'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { SetupBanner, setupBannerGradientPresets } from 'components/vault/SetupBanner'
import { VaultViewMode } from 'components/VaultTabSwitch'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'

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
  const autoTriggersData$ = automationTriggersData$(vaultId)
  const [automationTriggersData] = useObservable(autoTriggersData$)

  const isAllowedForAutomation = isSupportedAutomationIlk(getNetworkName(), ilk)
  const basicBSEnabled = useFeatureToggle('BasicBS')

  const slData = automationTriggersData ? extractStopLossData(automationTriggersData) : null

  return !slData?.isStopLossEnabled && isAllowedForAutomation && !debt.isZero() ? (
    <>
      <SetupBanner
        header={
          !basicBSEnabled
            ? t('vault-banners.setup-stop-loss.header')
            : t('vault-banners.get-protection.header')
        }
        content={
          !basicBSEnabled
            ? t('vault-banners.setup-stop-loss.content', { token })
            : t('vault-banners.get-protection.content', { token })
        }
        button={
          !basicBSEnabled
            ? t('vault-banners.setup-stop-loss.button')
            : t('vault-banners.get-protection.button')
        }
        backgroundImage="/static/img/setup-banner/stop-loss.svg"
        backgroundColor={setupBannerGradientPresets.stopLoss[0]}
        backgroundColorEnd={setupBannerGradientPresets.stopLoss[1]}
        handleClick={() => {
          uiChanges.publish(TAB_CHANGE_SUBJECT, {
            type: 'change-tab',
            currentMode: VaultViewMode.Protection,
          })
        }}
      />
    </>
  ) : null
}
