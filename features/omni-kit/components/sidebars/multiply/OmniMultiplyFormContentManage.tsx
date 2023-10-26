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
import { OmniMultiplyFormAction, OmniProductType } from 'features/omni-kit/types'
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
  } = useOmniProductContext(OmniProductType.Multiply)

  return (
    <>
      {uiDropdown === 'adjust' && <OmniMultiplyFormContentAdjust />}
      {uiDropdown === 'collateral' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: OmniMultiplyFormAction.DepositCollateralMultiply,
                label: t('vault-actions.deposit'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', OmniMultiplyFormAction.DepositCollateralMultiply)
                  updateState('action', OmniMultiplyFormAction.DepositCollateralMultiply)
                },
              },
              {
                id: OmniMultiplyFormAction.WithdrawMultiply,
                label: t('vault-actions.withdraw'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', OmniMultiplyFormAction.WithdrawMultiply)
                  updateState('action', OmniMultiplyFormAction.WithdrawMultiply)
                },
              },
            ]}
          />
          {uiPill === OmniMultiplyFormAction.DepositCollateralMultiply && (
            <OmniMultiplyFormContentDepositCollateral />
          )}
          {uiPill === OmniMultiplyFormAction.WithdrawMultiply && (
            <OmniMultiplyFormContentWithdrawCollateral />
          )}
        </>
      )}
      {uiDropdown === 'quote' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: OmniMultiplyFormAction.PaybackMultiply,
                label: t('system.actions.multiply.reduce-debt'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', OmniMultiplyFormAction.PaybackMultiply)
                  updateState('action', OmniMultiplyFormAction.PaybackMultiply)
                },
              },
              {
                id: OmniMultiplyFormAction.GenerateMultiply,
                label: t('vault-actions.withdraw'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', OmniMultiplyFormAction.GenerateMultiply)
                  updateState('action', OmniMultiplyFormAction.GenerateMultiply)
                },
              },
            ]}
          />
          {uiPill === OmniMultiplyFormAction.DepositQuoteMultiply && (
            <OmniMultiplyFormContentDepositQuote />
          )}
          {uiPill === OmniMultiplyFormAction.PaybackMultiply && <OmniMultiplyFormContentPayback />}
          {uiPill === OmniMultiplyFormAction.GenerateMultiply && (
            <OmniMultiplyFormContentGenerate />
          )}
        </>
      )}
      {uiDropdown === 'switch' && <OmniMultiplyFormContentSwitch />}
      {uiDropdown === 'close' && <OmniMultiplyFormContentClose />}
    </>
  )
}
