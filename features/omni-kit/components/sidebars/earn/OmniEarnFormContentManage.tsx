import { ActionPills } from 'components/ActionPills'
import {
  OmniEarnFormContentDeposit,
  OmniEarnFormContentWithdraw,
} from 'features/omni-kit/components/sidebars/earn'
import { useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniEarnFormAction, OmniProductType } from 'features/omni-kit/types'
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
    dynamicMetadata: {
      elements: { earnExtraUiDropdownContent },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return (
    <>
      {uiDropdown === 'liquidity' && (
        <>
          <ActionPills
            active={uiPill}
            items={[
              {
                id: OmniEarnFormAction.DepositEarn,
                label: t('vault-actions.deposit'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', OmniEarnFormAction.DepositEarn)
                  updateState('action', OmniEarnFormAction.DepositEarn)
                },
              },
              {
                id: OmniEarnFormAction.WithdrawEarn,
                label: t('vault-actions.withdraw'),
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiPill', OmniEarnFormAction.WithdrawEarn)
                  updateState('action', OmniEarnFormAction.WithdrawEarn)
                },
                disabled: position.quoteTokenAmount.isZero(),
              },
            ]}
          />
          {uiPill === OmniEarnFormAction.DepositEarn && <OmniEarnFormContentDeposit />}
          {uiPill === OmniEarnFormAction.WithdrawEarn && <OmniEarnFormContentWithdraw />}
        </>
      )}
      {earnExtraUiDropdownContent}
    </>
  )
}
