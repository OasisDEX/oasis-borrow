import { ActionPills } from 'components/ActionPills'
import { AjnaBorrowAction, AjnaBorrowPanel } from 'features/ajna/common/types'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

interface AjnaBorrowFormContentManageProps {
  panel: AjnaBorrowPanel
}

export function AjnaBorrowFormContentManage({ panel }: AjnaBorrowFormContentManageProps) {
  const { t } = useTranslation()
  const [active, setActive] = useState<AjnaBorrowAction>('deposit')

  useEffect(() => {
    setActive(panel === 'collateral' ? 'deposit' : 'generate')
  }, [panel])

  return (
    <Grid gap={3}>
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
      Manage step on {panel} panel with {active} tab.
    </Grid>
  )
}
