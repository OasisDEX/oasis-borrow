import { ActionPills } from 'components/ActionPills'
import { AjnaBorrowFormContentDeposit } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormContentDeposit'
import { AjnaBorrowFormContentGenerate } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormContentGenerate'
import { AjnaBorrowFormContentPayback } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormContentPayback'
import { AjnaBorrowFormContentSwitch } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormContentSwitch'
import { AjnaBorrowFormContentWithdraw } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormContentWithdraw'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { AjnaBorrowFormContentAdjust } from './AjnaBorrowFormContentAdjust'
import { AjnaBorrowFormContentClose } from './AjnaBorrowFormContentClose'

export function AjnaBorrowFormContentManage() {
  const { t } = useTranslation()
  const {
    form: {
      dispatch,
      state: { uiDropdown, uiPill },
      updateState,
    },
  } = useGenericProductContext('borrow')

  return (
    <>
      {uiDropdown === 'collateral' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
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
            ]}
          />
          {uiPill === 'deposit-borrow' && <AjnaBorrowFormContentDeposit />}
          {uiPill === 'withdraw-borrow' && <AjnaBorrowFormContentWithdraw />}
        </>
      )}
      {uiDropdown === 'quote' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: 'generate-borrow',
                label: t('vault-actions.borrow'),
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
            ]}
          />
          {uiPill === 'generate-borrow' && <AjnaBorrowFormContentGenerate />}
          {uiPill === 'payback-borrow' && <AjnaBorrowFormContentPayback />}
        </>
      )}
      {uiDropdown === 'switch' && <AjnaBorrowFormContentSwitch />}
      {uiDropdown === 'close' && <AjnaBorrowFormContentClose />}
      {uiDropdown === 'adjust' && <AjnaBorrowFormContentAdjust />}
    </>
  )
}
