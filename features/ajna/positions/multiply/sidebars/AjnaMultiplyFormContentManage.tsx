import { ActionPills } from 'components/ActionPills'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaMultiplyFormContentDeposit } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentDeposit'
import { AjnaMultiplyFormContentWithdraw } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentWithdraw'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaMultiplyFormContentManage() {
  const { t } = useTranslation()
  const {
    form: {
      dispatch,
      state: { uiDropdown, uiPill },
      updateState,
    },
  } = useAjnaProductContext('multiply')

  return (
    <>
      {uiDropdown === 'collateral' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: 'deposit-multiply',
                label: t('vault-actions.deposit'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'deposit-multiply')
                  updateState('action', 'deposit-multiply')
                },
              },
              {
                id: 'withdraw-multiply',
                label: t('vault-actions.withdraw'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'withdraw-multiply')
                  updateState('action', 'withdraw-multiply')
                },
              },
            ]}
          />
          {uiPill === 'deposit-multiply' && <AjnaMultiplyFormContentDeposit />}
          {uiPill === 'withdraw-multiply' && <AjnaMultiplyFormContentWithdraw />}
        </>
      )}
      {uiDropdown === 'quote' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: 'buy-collateral-multiply',
                label: t('system.actions.multiply.buy-coll'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'buy-collateral-multiply')
                  updateState('action', 'buy-collateral-multiply')
                },
              },
              {
                id: 'payback-multiply',
                label: t('system.actions.multiply.reduce-debt'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'payback-multiply')
                  updateState('action', 'payback-multiply')
                },
              },
              {
                id: 'withdraw-quote-multiply',
                label: t('vault-actions.withdraw'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'withdraw-quote-multiply')
                  updateState('action', 'withdraw-quote-multiply')
                },
              },
            ]}
          />
          {uiPill === 'buy-collateral-multiply' && <>Buy</>}
          {uiPill === 'payback-multiply' && <>Payback</>}
          {uiPill === 'withdraw-quote-multiply' && <>Withdraw</>}
        </>
      )}
      {uiDropdown === 'switch' && <>Switch</>}
      {uiDropdown === 'close' && <>Close</>}
    </>
  )
}
