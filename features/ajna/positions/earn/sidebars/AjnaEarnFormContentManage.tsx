import { ActionPills } from 'components/ActionPills'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { AjnaEarnFormContentAdjust } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormContentAdjust'
import { AjnaEarnFormContentClaimCollateral } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormContentClaimCollateral'
import { AjnaEarnFormContentDeposit } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormContentDeposit'
import { AjnaEarnFormContentWithdraw } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormContentWithdraw'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormContentManage() {
  const { t } = useTranslation()
  const {
    form: {
      dispatch,
      state: { uiDropdown, uiPill },
      updateState,
    },
    position: {
      currentPosition: { position },
    },
  } = useGenericProductContext('earn')

  return (
    <>
      {uiDropdown === 'adjust' && <AjnaEarnFormContentAdjust />}
      {uiDropdown === 'liquidity' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: 'deposit-earn',
                label: t('vault-actions.deposit'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'deposit-earn')
                  updateState('action', 'deposit-earn')
                },
              },
              {
                id: 'withdraw-earn',
                label: t('vault-actions.withdraw'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', 'withdraw-earn')
                  updateState('action', 'withdraw-earn')
                },
                disabled: position.quoteTokenAmount.isZero(),
              },
            ]}
          />
          {
            {
              'deposit-earn': <AjnaEarnFormContentDeposit />,
              'withdraw-earn': <AjnaEarnFormContentWithdraw />,
            }[uiPill]
          }
        </>
      )}
      {uiDropdown === 'claim-collateral' && <AjnaEarnFormContentClaimCollateral />}
    </>
  )
}
