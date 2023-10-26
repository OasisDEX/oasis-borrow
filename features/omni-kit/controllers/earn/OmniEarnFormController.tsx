import { OmniFormContentTransaction } from 'features/omni-kit/components/sidebars'
import {
  OmniEarnFormContentManage,
  OmniEarnFormContentOpen,
} from 'features/omni-kit/components/sidebars/earn'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniEarnFormAction, OmniProductType } from 'features/omni-kit/types'
import { OmniFormView } from 'features/omni-kit/views'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { circle_slider } from 'theme/icons'

export function OmniEarnFormController({ txHandler }: { txHandler: () => () => void }) {
  const { t } = useTranslation()
  const {
    environment: { flow, quoteToken, quoteIcon },
    steps: { currentStep },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { uiDropdown },
      updateState,
    },
    position: {
      currentPosition: {
        position: { quoteTokenAmount },
        simulation,
      },
    },
    dynamicMetadata: {
      elements: { riskSidebar, earnFormOrderAsElement },
      values: { extraDropdownItems },
      handlers: { txSuccessEarnHandler, customReset },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return (
    <OmniFormView
      {...(flow === 'manage' &&
        quoteTokenAmount.gt(zero) && {
          dropdown: {
            forcePanel: uiDropdown,
            disabled: currentStep !== 'manage',
            items: [
              {
                label: t('system.adjust-position'),
                panel: 'adjust',
                shortLabel: t('adjust'),
                icon: circle_slider,
                iconShrink: 2,
                action: () => {
                  dispatch({ type: 'reset' })
                  customReset()
                  txSuccessEarnHandler()
                  updateState('uiPill', OmniEarnFormAction.DepositEarn)
                  updateState('action', OmniEarnFormAction.DepositEarn)
                },
              },
              {
                label: t('system.manage-liquidity', {
                  token: quoteToken,
                }),
                panel: 'liquidity',
                shortLabel: quoteToken,
                tokenIcon: quoteIcon,
                action: () => {
                  dispatch({ type: 'reset' })
                  customReset()
                  updateState('uiDropdown', 'liquidity')
                  updateState('uiPill', OmniEarnFormAction.DepositEarn)
                  updateState('action', OmniEarnFormAction.DepositEarn)
                },
              },
              ...extraDropdownItems,
            ],
          },
        })}
      txSuccessAction={() => {
        if (quoteTokenAmount.isZero() || simulation?.quoteTokenAmount.isZero()) {
          updateState('uiPill', OmniEarnFormAction.DepositEarn)
          updateState('action', OmniEarnFormAction.DepositEarn)
          txSuccessEarnHandler()
        }
      }}
      txHandler={txHandler}
    >
      {currentStep === 'risk' && riskSidebar}
      {currentStep === 'setup' && <OmniEarnFormContentOpen />}
      {currentStep === 'manage' && <OmniEarnFormContentManage />}
      {currentStep === 'transaction' && (
        <OmniFormContentTransaction orderInformation={earnFormOrderAsElement} />
      )}
    </OmniFormView>
  )
}
