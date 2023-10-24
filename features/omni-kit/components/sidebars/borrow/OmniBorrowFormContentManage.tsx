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
import { OmniProductType } from 'features/omni-kit/types'
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
      {uiDropdown === 'collateral' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: 'deposit-borrow',
                label: t('vault-actions.deposit'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'deposit-borrow')
                  updateState('action', 'deposit-borrow')
                },
              },
              {
                id: 'withdraw-borrow',
                label: t('vault-actions.withdraw'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'withdraw-borrow')
                  updateState('action', 'withdraw-borrow')
                },
              },
            ]}
          />
          {uiPill === 'deposit-borrow' && <OmniBorrowFormContentDeposit />}
          {uiPill === 'withdraw-borrow' && <OmniBorrowFormContentWithdraw />}
        </>
      )}
      {uiDropdown === 'quote' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: 'generate-borrow',
                label: t('vault-actions.borrow'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'generate-borrow')
                  updateState('action', 'generate-borrow')
                },
              },
              {
                id: 'payback-borrow',
                label: t('vault-actions.payback'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'payback-borrow')
                  updateState('action', 'payback-borrow')
                },
              },
            ]}
          />
          {uiPill === 'generate-borrow' && <OmniBorrowFormContentGenerate />}
          {uiPill === 'payback-borrow' && <OmniBorrowFormContentPayback />}
        </>
      )}
      {uiDropdown === 'switch' && <OmniBorrowFormContentSwitch />}
      {uiDropdown === 'close' && <OmniBorrowFormContentClose />}
      {uiDropdown === 'adjust' && <OmniBorrowFormContentAdjust />}
    </>
  )
}
