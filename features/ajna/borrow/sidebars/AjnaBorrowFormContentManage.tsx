import { ActionPills } from 'components/ActionPills'
import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentGenerate } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentGenerate'
import { AjnaBorrowFormContentPayback } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentPayback'
import { AjnaBorrowFormContentWithdraw } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentWithdraw'
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
  } = useAjnaBorrowContext()

  return (
    <>
      <ActionPills
        active={uiPill}
        {...(uiDropdown === 'collateral'
          ? {
              items: [
                {
                  id: 'depositBorrow',
                  label: t('vault-actions.deposit'),
                  action: () => {
                    dispatch({ type: 'reset' })
                    updateState('uiPill', 'depositBorrow')
                    updateState('action', 'depositBorrow')
                  },
                },
                {
                  id: 'withdrawBorrow',
                  label: t('vault-actions.withdraw'),
                  action: () => {
                    dispatch({ type: 'reset' })
                    updateState('uiPill', 'withdrawBorrow')
                    updateState('action', 'withdrawBorrow')
                  },
                },
              ],
            }
          : {
              items: [
                {
                  id: 'generateBorrow',
                  label: t('vault-actions.generate'),
                  action: () => {
                    dispatch({ type: 'reset' })
                    updateState('uiPill', 'generateBorrow')
                    updateState('action', 'generateBorrow')
                  },
                },
                {
                  id: 'paybackAmount',
                  label: t('vault-actions.payback'),
                  action: () => {
                    dispatch({ type: 'reset' })
                    updateState('uiPill', 'paybackBorrow')
                    updateState('action', 'paybackBorrow')
                  },
                },
              ],
            })}
      />
      {
        {
          depositBorrow: <AjnaBorrowFormContentDeposit />,
          withdrawBorrow: <AjnaBorrowFormContentWithdraw />,
          generateBorrow: <AjnaBorrowFormContentGenerate />,
          paybackBorrow: <AjnaBorrowFormContentPayback />,
        }[uiPill]
      }
    </>
  )
}
