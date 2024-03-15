import { OmniFormContentTransaction } from 'features/omni-kit/components/sidebars'
import {
  OmniEarnFormContentManage,
  OmniEarnFormContentOpen,
} from 'features/omni-kit/components/sidebars/earn'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  OmniEarnFormAction,
  OmniProductType,
  OmniSidebarEarnPanel,
  OmniSidebarStep,
} from 'features/omni-kit/types'
import { OmniFormView } from 'features/omni-kit/views'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { circle_slider } from 'theme/icons'

export function OmniEarnFormController({ txHandler }: { txHandler: () => () => void }) {
  const { t } = useTranslation()
  const {
    environment: { isOpening, quoteToken, quoteIcon },
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
      handlers,
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return (
    <OmniFormView
      {...(!isOpening &&
        quoteTokenAmount.gt(zero) && {
          dropdown: {
            forcePanel: uiDropdown,
            disabled: currentStep !== OmniSidebarStep.Manage,
            items: [
              {
                label: t('system.adjust-position'),
                panel: OmniSidebarEarnPanel.Adjust,
                shortLabel: t('adjust'),
                icon: circle_slider,
                iconShrink: 2,
                action: () => {
                  dispatch({ type: 'reset' })
                  handlers?.customReset?.()
                  updateState('uiPill', OmniEarnFormAction.DepositEarn)
                  updateState('action', OmniEarnFormAction.DepositEarn)
                  handlers?.txSuccessEarnHandler?.()
                },
              },
              {
                label: t('system.manage-liquidity', {
                  token: quoteToken,
                }),
                panel: OmniSidebarEarnPanel.Liquidity,
                shortLabel: quoteToken,
                tokenIcon: quoteIcon,
                action: () => {
                  dispatch({ type: 'reset' })
                  handlers?.customReset?.()
                  updateState('uiDropdown', OmniSidebarEarnPanel.Liquidity)
                  updateState('uiPill', OmniEarnFormAction.DepositEarn)
                  updateState('action', OmniEarnFormAction.DepositEarn)
                },
              },
              ...(extraDropdownItems ?? []),
            ],
          },
        })}
      txSuccessAction={() => {
        if (quoteTokenAmount.isZero() || simulation?.quoteTokenAmount.isZero()) {
          updateState('uiPill', OmniEarnFormAction.DepositEarn)
          updateState('action', OmniEarnFormAction.DepositEarn)
          handlers?.txSuccessEarnHandler?.()
        }
      }}
      txHandler={txHandler}
    >
      {currentStep === OmniSidebarStep.Risk && riskSidebar}
      {currentStep === OmniSidebarStep.Setup && <OmniEarnFormContentOpen />}
      {currentStep === OmniSidebarStep.Manage && <OmniEarnFormContentManage />}
      {currentStep === OmniSidebarStep.Transaction && (
        <OmniFormContentTransaction orderInformation={earnFormOrderAsElement} />
      )}
    </OmniFormView>
  )
}
