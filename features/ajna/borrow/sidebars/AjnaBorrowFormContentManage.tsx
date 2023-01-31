import { ActionPills } from 'components/ActionPills'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentGenerate } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentGenerate'
import { AjnaBorrowFormContentPayback } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentPayback'
import { AjnaBorrowFormContentWithdraw } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentWithdraw'
import { AjnaBorrowAction, AjnaBorrowPanel } from 'features/ajna/common/types'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'

interface AjnaBorrowFormContentManageProps {
  panel: AjnaBorrowPanel
}

export function AjnaBorrowFormContentManage({ panel }: AjnaBorrowFormContentManageProps) {
  const { t } = useTranslation()
  const {
    form: { updateState },
  } = useAjnaBorrowContext()
  const [active, setActive] = useState<Exclude<AjnaBorrowAction, 'open'>>('deposit')

  useEffect(() => {
    setActive(panel === 'collateral' ? 'deposit' : 'generate')
  }, [panel])
  useEffect(() => updateState('action', active), [active])

  return (
    <>
      <ActionPills
        active={active}
        {...(panel === 'collateral'
          ? {
              items: [
                {
                  id: 'deposit',
                  label: t('vault-actions.deposit'),
                  action: () => setActive('deposit'),
                },
                {
                  id: 'withdraw',
                  label: t('vault-actions.withdraw'),
                  action: () => setActive('withdraw'),
                },
              ],
            }
          : {
              items: [
                {
                  id: 'generate',
                  label: t('vault-actions.generate'),
                  action: () => setActive('generate'),
                },
                {
                  id: 'payback',
                  label: t('vault-actions.payback'),
                  action: () => setActive('payback'),
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
        }[active]
      }
    </>
  )
}
