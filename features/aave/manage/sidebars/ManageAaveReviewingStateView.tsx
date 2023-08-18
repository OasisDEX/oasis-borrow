import { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import { isAllowanceNeeded } from 'features/aave/types'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { GetReviewingSidebarProps } from './GetReviewingSidebarProps'
import {
  isLocked,
  ManageAaveStateProps,
  textButtonReturningToAdjust,
  WithDropdownConfig,
} from './SidebarManageAaveVault'

export function ManageAaveReviewingStateView({
  state,
  send,
  dropdownConfig,
  automation,
}: WithDropdownConfig<ManageAaveStateProps>) {
  const { t } = useTranslation()

  const allowanceNeeded = isAllowanceNeeded(state.context)
  // TODO validation suppressed for testing trigger execution
  const stopLossError = automation?.stopLoss?.stopLossError

  const label = allowanceNeeded
    ? t('set-allowance-for', {
        token: state.context.transactionToken || state.context.strategyConfig.tokens.deposit,
      })
    : t('manage-earn.aave.vault-form.confirm-btn')

  const sidebarSectionProps: SidebarSectionProps = {
    ...GetReviewingSidebarProps({ state, send, automation }),
    primaryButton: {
      isLoading: false,
      disabled: !state.can('NEXT_STEP') || isLocked(state) || stopLossError,
      label: label,
      action: () => send('NEXT_STEP'),
    },
    textButton: state.matches('frontend.reviewingAdjusting')
      ? textButtonReturningToAdjust({ state, send }).textButton
      : undefined,
    dropdown: dropdownConfig,
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
