import { ActionPills } from 'components/ActionPills'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentGenerate } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentGenerate'
import { AjnaBorrowFormContentPayback } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentPayback'
import { AjnaBorrowFormContentWithdraw } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentWithdraw'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormContentManage() {
  const { t } = useTranslation()
  const {
    form: {
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
                  id: 'deposit',
                  label: t('vault-actions.deposit'),
                  action: () => updateState('uiPill', 'deposit'),
                },
                {
                  id: 'withdraw',
                  label: t('vault-actions.withdraw'),
                  action: () => updateState('uiPill', 'withdraw'),
                },
              ],
            }
          : {
              items: [
                {
                  id: 'generate',
                  label: t('vault-actions.generate'),
                  action: () => updateState('uiPill', 'generate'),
                },
                {
                  id: 'payback',
                  label: t('vault-actions.payback'),
                  action: () => updateState('uiPill', 'payback'),
                },
              ],
            })}
      />
      {
        {
          deposit: <AjnaBorrowFormContentDeposit />,
          withdraw: <AjnaBorrowFormContentWithdraw />,
          generate: <AjnaBorrowFormContentGenerate />,
          payback: <AjnaBorrowFormContentPayback />,
        }[uiPill]
      }
    </>
  )
}
