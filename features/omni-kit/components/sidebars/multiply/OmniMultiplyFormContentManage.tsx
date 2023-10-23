import { ActionPills } from 'components/ActionPills'
import {
  OmniMultiplyFormContentAdjust,
  OmniMultiplyFormContentClose,
  OmniMultiplyFormContentDepositCollateral,
  OmniMultiplyFormContentDepositQuote,
  OmniMultiplyFormContentGenerate,
  OmniMultiplyFormContentPayback,
  OmniMultiplyFormContentSwitch,
  OmniMultiplyFormContentWithdrawCollateral,
} from 'features/omni-kit/components/sidebars/multiply'
import { useOmniProductContext } from 'features/omni-kit/contexts'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function OmniMultiplyFormContentManage() {
  const { t } = useTranslation()
  const {
    form: {
      dispatch,
      state: { uiDropdown, uiPill },
      updateState,
    },
  } = useOmniProductContext('multiply')

  return (
    <>
      {uiDropdown === 'adjust' && <OmniMultiplyFormContentAdjust />}
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
          {uiPill === 'deposit-collateral-multiply' && <OmniMultiplyFormContentDepositCollateral />}
          {uiPill === 'withdraw-multiply' && <OmniMultiplyFormContentWithdrawCollateral />}
        </>
      )}
      {uiDropdown === 'quote' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
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
          {uiPill === 'deposit-quote-multiply' && <OmniMultiplyFormContentDepositQuote />}
          {uiPill === 'payback-multiply' && <OmniMultiplyFormContentPayback />}
          {uiPill === 'generate-multiply' && <OmniMultiplyFormContentGenerate />}
        </>
      )}
      {uiDropdown === 'switch' && <OmniMultiplyFormContentSwitch />}
      {uiDropdown === 'close' && <OmniMultiplyFormContentClose />}
    </>
  )
}
