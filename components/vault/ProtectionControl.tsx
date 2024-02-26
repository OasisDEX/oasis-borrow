import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { AUTO_SELL_FORM_CHANGE } from 'features/automation/common/state/autoBSFormChange.constants'
import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import { ProtectionDetailsControl } from 'features/automation/protection/common/controls/ProtectionDetailsControl'
import { ProtectionFormControl } from 'features/automation/protection/common/controls/ProtectionFormControl'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange.constants'
import type { StopLossFormChange } from 'features/automation/protection/stopLoss/state/StopLossFormChange.types'
import { VaultNotice } from 'features/notices/VaultsNoticesView'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { warning } from 'theme/icons'
import { Container } from 'theme-ui'

import { DefaultVaultLayout } from './DefaultVaultLayout'

interface ZeroDebtProtectionBannerProps {
  useTranslationKeys?: boolean
  header: string
  description: string | JSX.Element
  debtToken?: string
  ratioParamTranslationKey?: string
  bannerStrategiesKey?: string
  showLink?: boolean
}

function ZeroDebtProtectionBanner({
  useTranslationKeys = true,
  header,
  description,
  showLink = true,
  debtToken,
  ratioParamTranslationKey,
  bannerStrategiesKey,
}: ZeroDebtProtectionBannerProps) {
  const { t } = useTranslation()

  return (
    <VaultNotice
      status={<Icon size="34px" icon={warning} />}
      withClose={false}
      header={useTranslationKeys ? t(header, { debtToken }) : header}
      subheader={
        <>
          {useTranslationKeys && typeof description === 'string'
            ? t(description, {
                ratioParamTranslationKey: t(ratioParamTranslationKey!),
                bannerStrategiesKey: t(bannerStrategiesKey!),
              })
            : description}
          {showLink && (
            <>
              {', '}
              <AppLink href={EXTERNAL_LINKS.KB.STOP_LOSS} sx={{ fontSize: 3 }}>
                {t('here')}.
              </AppLink>
            </>
          )}
        </>
      }
      color="primary100"
    />
  )
}

function getZeroDebtProtectionBannerProps({
  stopLossWriteEnabled,
  isVaultDebtZero,
  isVaultDebtBelowDustLimit,
  vaultHasNoProtection,
  debtToken,
  ratioParamTranslationKey,
  bannerStrategiesKey,
}: {
  stopLossWriteEnabled: boolean
  isVaultDebtZero: boolean
  isVaultDebtBelowDustLimit: boolean
  debtToken: string
  ratioParamTranslationKey: string
  bannerStrategiesKey: string
  vaultHasNoProtection?: boolean
}): ZeroDebtProtectionBannerProps {
  if (stopLossWriteEnabled) {
    if (isVaultDebtZero && vaultHasNoProtection) {
      return {
        header: 'protection.zero-debt-heading',
        description: 'protection.zero-debt-description',
        debtToken,
        ratioParamTranslationKey,
        bannerStrategiesKey,
      }
    } else if (isVaultDebtBelowDustLimit) {
      return {
        header: 'protection.below-dust-limit-heading',
        description: 'protection.zero-debt-description',
        debtToken,
        ratioParamTranslationKey,
        bannerStrategiesKey,
      }
    } else
      return {
        header: 'protection.unable-to-access-protection',
        description: 'please-try-again-later',
        showLink: false,
      }
  } else {
    return {
      useTranslationKeys: false,
      showLink: false,
      header: 'Stop loss protection is not yet available for these positions.',
      description: (
        <>
          Currently, the Summer.Fi Stop loss is not yet available for this position. Let the team
          know if you would like to set-up a Stop loss for this position on{' '}
          <AppLink href="mailto:support@summer.fi">support@summer.fi</AppLink> or our{' '}
          <AppLink href={EXTERNAL_LINKS.DISCORD}>Discord</AppLink>.
        </>
      ),
    }
  }
}

export interface ProtectionControlOverridesProps {
  AutoSellDetailsView?: () => JSX.Element | null
  AutoSellFormControl?: () => JSX.Element | null
}

export function ProtectionControl({
  AutoSellDetailsView,
  AutoSellFormControl,
}: ProtectionControlOverridesProps = {}) {
  const { txHelpers$ } = useMainContext()
  const {
    positionData: { debt, debtFloor, debtToken },
    metadata: {
      stopLossMetadata: {
        translations: { ratioParamTranslationKey, bannerStrategiesKey },
        stopLossWriteEnabled,
      },
    },
    triggerData: { autoSellTriggerData, stopLossTriggerData },
  } = useAutomationContext()
  const [txHelpersData] = useObservable(txHelpers$)
  const [stopLossState] = useUIChanges<StopLossFormChange>(STOP_LOSS_FORM_CHANGE)
  const [autoSellState] = useUIChanges<AutoBSFormChange>(AUTO_SELL_FORM_CHANGE)

  const vaultHasActiveTrigger =
    stopLossTriggerData.isStopLossEnabled || autoSellTriggerData.isTriggerEnabled

  return (
    <WithLoadingIndicator
      value={[stopLossState, autoSellState]}
      customLoader={<VaultContainerSpinner />}
    >
      {() =>
        vaultHasActiveTrigger || (!debt.isZero() && debt.gt(debtFloor)) ? (
          <DefaultVaultLayout
            detailsViewControl={<ProtectionDetailsControl AutoSell={AutoSellDetailsView} />}
            editForm={
              <ProtectionFormControl
                txHelpers={txHelpersData}
                CustomAutoSellFormControl={AutoSellFormControl}
              />
            }
          />
        ) : (
          <Container
            variant="vaultPageContainer"
            sx={{
              zIndex: 0,
            }}
          >
            <ZeroDebtProtectionBanner
              {...getZeroDebtProtectionBannerProps({
                stopLossWriteEnabled,
                isVaultDebtZero: debt.isZero(),
                isVaultDebtBelowDustLimit: debt.lte(debtFloor),
                vaultHasNoProtection: !vaultHasActiveTrigger,
                debtToken,
                ratioParamTranslationKey,
                bannerStrategiesKey,
              })}
            />
          </Container>
        )
      }
    </WithLoadingIndicator>
  )
}
