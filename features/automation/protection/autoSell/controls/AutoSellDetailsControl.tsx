import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { AppLink } from 'components/Links'
import { checkIfEditingAutoBS } from 'features/automation/common/helpers'
import {
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange'
import { AutoSellDetailsLayout } from 'features/automation/protection/autoSell/controls/AutoSellDetailsLayout'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

interface AutoSellDetailsControlProps {
  vault: Vault
  autoSellTriggerData: AutoBSTriggerData
  isAutoSellActive: boolean
  isconstantMultipleEnabled: boolean
}

export function AutoSellDetailsControl({
  vault,
  autoSellTriggerData,
  isAutoSellActive,
  isconstantMultipleEnabled,
}: AutoSellDetailsControlProps) {
  const { t } = useTranslation()
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const [autoSellState] = useUIChanges<AutoBSFormChange>(AUTO_SELL_FORM_CHANGE)
  const { uiChanges } = useAppContext()
  const {
    execCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice,
    isTriggerEnabled,
  } = autoSellTriggerData
  const isDebtZero = vault.debt.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  const isEditing = checkIfEditingAutoBS({
    autoBSTriggerData: autoSellTriggerData,
    autoBSState: autoSellState,
    isRemoveForm: autoSellState.currentForm === 'remove',
  })

  const autoSellDetailsLayoutOptionalParams = {
    ...(isTriggerEnabled && {
      triggerColRatio: execCollRatio,
      nextSellPrice: executionPrice,
      targetColRatio: targetCollRatio,
      threshold: maxBuyOrMinSellPrice,
    }),
    ...(isEditing && {
      afterTriggerColRatio: autoSellState.execCollRatio,
      afterTargetColRatio: autoSellState.targetCollRatio,
    }),
  }

  if (readOnlyAutoBSEnabled) {
    return null
  }

  if (isDebtZero) {
    return null
  }

  return (
    <Grid>
      {isAutoSellActive ? (
        <AutoSellDetailsLayout
          token={vault.token}
          autoSellTriggerData={autoSellTriggerData}
          {...autoSellDetailsLayoutOptionalParams}
        />
      ) : (
        <Banner
          title={t('auto-sell.banner.header')}
          description={[
            <>
              {t('auto-sell.banner.content')}{' '}
              <AppLink href="https://kb.oasis.app/help/auto-buy-and-auto-sell" sx={{ fontSize: 2 }}>
                {t('here')}.
              </AppLink>
            </>,
            ...(isconstantMultipleEnabled
              ? [
                  <Text as="span" sx={{ color: 'primary100', fontWeight: 'semiBold' }}>
                    {t('auto-sell.banner.cm-warning')}
                  </Text>,
                ]
              : []),
          ]}
          image={{
            src: '/static/img/setup-banner/auto-sell.svg',
            backgroundColor: bannerGradientPresets.autoSell[0],
            backgroundColorEnd: bannerGradientPresets.autoSell[1],
          }}
          button={{
            action: () => {
              uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                type: 'Protection',
                currentProtectionFeature: 'autoSell',
              })
            },
            text: t('auto-sell.banner.button'),
            disabled: isconstantMultipleEnabled,
          }}
        />
      )}
    </Grid>
  )
}
