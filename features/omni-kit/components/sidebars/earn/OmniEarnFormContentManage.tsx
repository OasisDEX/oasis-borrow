import { ActionPills } from 'components/ActionPills'
import {
  OmniEarnFormContentDeposit,
  OmniEarnFormContentWithdraw,
} from 'features/omni-kit/components/sidebars/earn'
import { useOmniProductContext } from 'features/omni-kit/contexts'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function OmniEarnFormContentManage() {
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
    dynamicMetadata,
  } = useOmniProductContext('earn')

  const {
    elements: { earnExtraUiDropdownContent },
  } = dynamicMetadata('earn')

  return (
    <>
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
              'deposit-earn': <OmniEarnFormContentDeposit />,
              'withdraw-earn': <OmniEarnFormContentWithdraw />,
            }[uiPill]
          }
        </>
      )}
      {earnExtraUiDropdownContent}
    </>
  )
}
