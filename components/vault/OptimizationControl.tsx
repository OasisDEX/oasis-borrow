import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { AUTO_BUY_FORM_CHANGE } from 'features/automation/common/state/autoBSFormChange.constants'
import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import { AUTO_TAKE_PROFIT_FORM_CHANGE } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.constants'
import type { AutoTakeProfitFormChange } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.types'
import { OptimizationDetailsControl } from 'features/automation/optimization/common/controls/OptimizationDetailsControl'
import { OptimizationFormControl } from 'features/automation/optimization/common/controls/OptimizationFormControl'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange.constants'
import type { ConstantMultipleFormChange } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange.types'
import { VaultNotice } from 'features/notices/VaultsNoticesView'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useAppConfig } from 'helpers/config'
import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Container } from 'theme-ui'
import { warning } from 'theme/icons'

import { DefaultVaultLayout } from './DefaultVaultLayout'

interface ZeroDebtOptimizationBannerProps {
  useTranslationKeys?: boolean
  header: string
  description: string
  showLink?: boolean
}

function ZeroDebtOptimizationBanner({
  useTranslationKeys = true,
  header,
  description,
  showLink = true,
}: ZeroDebtOptimizationBannerProps) {
  const { t } = useTranslation()

  return (
    <VaultNotice
      status={<Icon size="34px" icon={warning} />}
      withClose={false}
      header={useTranslationKeys ? t(header) : header}
      subheader={
        <>
          {useTranslationKeys ? t(description) : description}
          {showLink && (
            <>
              {', '}
              <AppLink href={EXTERNAL_LINKS.KB.HELP} sx={{ fontSize: 3 }}>
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
function getZeroDebtOptimizationBannerProps({
  readOnlyAutoBSEnabled,
  constantMultipleReadOnlyEnabled,
  readOnlyAutoTakeProfitEnabled,
  isVaultDebtZero,
  vaultHasNoActiveBuyTrigger,
  vaultHasNoActiveConstantMultipleTriggers,
  vaultHasNoActiveAutoTakeProfitTrigger,
}: {
  readOnlyAutoBSEnabled: boolean
  constantMultipleReadOnlyEnabled: boolean
  readOnlyAutoTakeProfitEnabled: boolean
  isVaultDebtZero: boolean
  vaultHasNoActiveBuyTrigger?: boolean
  vaultHasNoActiveConstantMultipleTriggers?: boolean
  vaultHasNoActiveAutoTakeProfitTrigger?: boolean
}): ZeroDebtOptimizationBannerProps {
  if (
    !readOnlyAutoBSEnabled &&
    !constantMultipleReadOnlyEnabled &&
    !readOnlyAutoTakeProfitEnabled
  ) {
    if (
      isVaultDebtZero &&
      vaultHasNoActiveBuyTrigger &&
      vaultHasNoActiveConstantMultipleTriggers &&
      vaultHasNoActiveAutoTakeProfitTrigger
    ) {
      return {
        header: 'optimization.zero-debt-heading',
        description: 'optimization.zero-debt-description',
      }
    } else
      return {
        header: 'optimization.unable-to-access-optimization',
        description: 'please-try-again-later',
        showLink: false,
      }
  } else {
    return {
      showLink: false,
      header: 'optimization.adding-new-triggers-disabled',
      description: 'optimization.adding-new-triggers-disabled-description',
    }
  }
}

interface OptimizationControlProps {
  vaultHistory: VaultHistoryEvent[]
}

export function OptimizationControl({ vaultHistory }: OptimizationControlProps) {
  const {
    positionData: { debt },
    triggerData: { autoBuyTriggerData, autoTakeProfitTriggerData, constantMultipleTriggerData },
  } = useAutomationContext()
  const { txHelpers$ } = useMainContext()
  const [txHelpersData] = useObservable(txHelpers$)
  const [autoBuyState] = useUIChanges<AutoBSFormChange>(AUTO_BUY_FORM_CHANGE)
  const [autoTakeProfitState] = useUIChanges<AutoTakeProfitFormChange>(AUTO_TAKE_PROFIT_FORM_CHANGE)
  const [constantMultipleState] = useUIChanges<ConstantMultipleFormChange>(
    CONSTANT_MULTIPLE_FORM_CHANGE,
  )

  const {
    ReadOnlyBasicBS: readOnlyAutoBSEnabled,
    ConstantMultipleReadOnly: constantMultipleReadOnlyEnabled,
    ReadOnlyAutoTakeProfit: readOnlyAutoTakeProfitEnabled,
  } = useAppConfig('features')

  const vaultHasActiveAutoBuyTrigger = autoBuyTriggerData.isTriggerEnabled
  const vaultHasActiveConstantMultipleTrigger = constantMultipleTriggerData.isTriggerEnabled
  const vaultHasActiveAutoTakeProfitTrigger = autoTakeProfitTriggerData.isTriggerEnabled

  return (
    <WithLoadingIndicator
      value={[autoBuyState, autoTakeProfitState, constantMultipleState]}
      customLoader={<VaultContainerSpinner />}
    >
      {() =>
        (!vaultHasActiveAutoBuyTrigger &&
          !vaultHasActiveConstantMultipleTrigger &&
          !vaultHasActiveAutoTakeProfitTrigger &&
          debt.isZero()) ||
        (!vaultHasActiveAutoBuyTrigger &&
          !vaultHasActiveConstantMultipleTrigger &&
          !vaultHasActiveAutoTakeProfitTrigger &&
          readOnlyAutoBSEnabled &&
          constantMultipleReadOnlyEnabled &&
          readOnlyAutoTakeProfitEnabled) ? (
          <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
            <ZeroDebtOptimizationBanner
              {...getZeroDebtOptimizationBannerProps({
                readOnlyAutoBSEnabled,
                isVaultDebtZero: debt.isZero(),
                vaultHasNoActiveBuyTrigger: !vaultHasActiveAutoBuyTrigger,
                constantMultipleReadOnlyEnabled,
                readOnlyAutoTakeProfitEnabled,
                vaultHasNoActiveConstantMultipleTriggers: !vaultHasActiveConstantMultipleTrigger,
                vaultHasNoActiveAutoTakeProfitTrigger: !vaultHasActiveAutoTakeProfitTrigger,
              })}
            />
          </Container>
        ) : (
          <DefaultVaultLayout
            detailsViewControl={<OptimizationDetailsControl vaultHistory={vaultHistory} />}
            editForm={<OptimizationFormControl txHelpers={txHelpersData} />}
          />
        )
      }
    </WithLoadingIndicator>
  )
}
