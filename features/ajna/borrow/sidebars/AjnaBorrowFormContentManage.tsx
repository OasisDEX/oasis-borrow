import { ActionPills } from 'components/ActionPills'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentGenerate } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentGenerate'
import { AjnaBorrowFormContentPayback } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentPayback'
import { AjnaBorrowFormContentWithdraw } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentWithdraw'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormContentManage() {
  const { t } = useTranslation()
  const {
    form: {
      dispatch,
      state: { uiDropdown, uiPill },
      updateState,
    },
  } = useAjnaProductContext('borrow')

  return (
    <>
      <ActionPills
        active={uiPill}
        {...(uiDropdown === 'collateral'
          ? {
              items: [
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
              ],
            }
          : {
              items: [
                {
                  id: 'generate-borrow',
                  label: t('vault-actions.generate'),
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
              ],
            })}
      />
      {
        {
          'deposit-borrow': <AjnaBorrowFormContentDeposit />,
          'withdraw-borrow': <AjnaBorrowFormContentWithdraw />,
          'generate-borrow': <AjnaBorrowFormContentGenerate />,
          'payback-borrow': <AjnaBorrowFormContentPayback />,
        }[uiPill]
      }
    </>
  )
}
