import { ActionPills } from 'components/ActionPills'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaMultiplyFormContentAdjust } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentAdjust'
import { AjnaMultiplyFormContentClose } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentClose'
import { AjnaMultiplyFormContentDepositCollateral } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentDepositCollateral'
import { AjnaMultiplyFormContentDepositQuote } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentDepositQuote'
import { AjnaMultiplyFormContentGenerate } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentGenerate'
import { AjnaMultiplyFormContentPayback } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentPayback'
import { AjnaMultiplyFormContentSwitch } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentSwitch'
import { AjnaMultiplyFormContentWithdrawCollateral } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormContentWithdrawCollateral'
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
      {uiDropdown === 'adjust' && <AjnaMultiplyFormContentAdjust />}
      {uiDropdown === 'collateral' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: 'deposit-collateral-multiply',
                label: t('vault-actions.deposit'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'deposit-collateral-multiply')
                  updateState('action', 'deposit-collateral-multiply')
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
          {uiPill === 'deposit-collateral-multiply' && <AjnaMultiplyFormContentDepositCollateral />}
          {uiPill === 'withdraw-multiply' && <AjnaMultiplyFormContentWithdrawCollateral />}
        </>
      )}
      {uiDropdown === 'quote' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: 'deposit-quote-multiply',
                label: t('system.actions.multiply.buy-coll'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'deposit-quote-multiply')
                  updateState('action', 'deposit-quote-multiply')
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
                id: 'generate-multiply',
                label: t('vault-actions.withdraw'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'generate-multiply')
                  updateState('action', 'generate-multiply')
                },
              },
            ]}
          />
          {uiPill === 'deposit-quote-multiply' && <AjnaMultiplyFormContentDepositQuote />}
          {uiPill === 'payback-multiply' && <AjnaMultiplyFormContentPayback />}
          {uiPill === 'generate-multiply' && <AjnaMultiplyFormContentGenerate />}
        </>
      )}
      {uiDropdown === 'switch' && <AjnaMultiplyFormContentSwitch />}
      {uiDropdown === 'close' && <AjnaMultiplyFormContentClose />}
    </>
  )
}
