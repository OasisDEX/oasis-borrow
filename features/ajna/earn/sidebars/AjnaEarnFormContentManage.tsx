import { ActionPills } from 'components/ActionPills'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import { AjnaEarnFormContentAdjust } from 'features/ajna/earn/sidebars/AjnaEarnFormContentAdjust'
import { AjnaEarnFormContentDeposit } from 'features/ajna/earn/sidebars/AjnaEarnFormContentDeposit'
import { AjnaEarnFormContentWithdraw } from 'features/ajna/earn/sidebars/AjnaEarnFormContentWithdraw'
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
  } = useAjnaProductContext('earn')

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
    </>
  )
}
