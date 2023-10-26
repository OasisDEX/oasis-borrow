import { ActionPills } from 'components/ActionPills'
import {
  OmniBorrowFormContentAdjust,
  OmniBorrowFormContentClose,
  OmniBorrowFormContentDeposit,
  OmniBorrowFormContentGenerate,
  OmniBorrowFormContentPayback,
  OmniBorrowFormContentSwitch,
  OmniBorrowFormContentWithdraw,
} from 'features/omni-kit/components/sidebars/borrow'
import { useOmniProductContext } from 'features/omni-kit/contexts'
import {
  OmniBorrowFormAction,
  OmniProductType,
  OmniSidebarBorrowPanel,
} from 'features/omni-kit/types'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function OmniBorrowFormContentManage() {
  const { t } = useTranslation()
  const {
    form: {
      dispatch,
      state: { uiDropdown, uiPill },
      updateState,
    },
  } = useOmniProductContext(OmniProductType.Borrow)

  return (
    <>
      {uiDropdown === OmniSidebarBorrowPanel.Collateral && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: OmniBorrowFormAction.DepositBorrow,
                label: t('vault-actions.deposit'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', OmniBorrowFormAction.DepositBorrow)
                  updateState('action', OmniBorrowFormAction.DepositBorrow)
                },
              },
              {
                id: OmniBorrowFormAction.WithdrawBorrow,
                label: t('vault-actions.withdraw'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', OmniBorrowFormAction.WithdrawBorrow)
                  updateState('action', OmniBorrowFormAction.WithdrawBorrow)
                },
              },
            ]}
          />
          {uiPill === OmniBorrowFormAction.DepositBorrow && <OmniBorrowFormContentDeposit />}
          {uiPill === OmniBorrowFormAction.WithdrawBorrow && <OmniBorrowFormContentWithdraw />}
        </>
      )}
      {uiDropdown === OmniSidebarBorrowPanel.Quote && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: OmniBorrowFormAction.GenerateBorrow,
                label: t('vault-actions.borrow'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', OmniBorrowFormAction.GenerateBorrow)
                  updateState('action', OmniBorrowFormAction.GenerateBorrow)
                },
              },
              {
                id: OmniBorrowFormAction.PaybackBorrow,
                label: t('vault-actions.payback'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', OmniBorrowFormAction.PaybackBorrow)
                  updateState('action', OmniBorrowFormAction.PaybackBorrow)
                },
              },
            ]}
          />
          {uiPill === OmniBorrowFormAction.GenerateBorrow && <OmniBorrowFormContentGenerate />}
          {uiPill === OmniBorrowFormAction.PaybackBorrow && <OmniBorrowFormContentPayback />}
        </>
      )}
      {uiDropdown === OmniSidebarBorrowPanel.Switch && <OmniBorrowFormContentSwitch />}
      {uiDropdown === OmniSidebarBorrowPanel.Close && <OmniBorrowFormContentClose />}
      {uiDropdown === OmniSidebarBorrowPanel.Adjust && <OmniBorrowFormContentAdjust />}
    </>
  )
}
