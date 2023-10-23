import { OmniFormView } from 'features/omni-kit/common/components/OmniFormView'
import { OmniFormContentTransaction } from 'features/omni-kit/common/sidebars/OmniFormContentTransaction'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniEarnFormContentManage } from 'features/omni-kit/sidebars/earn/OmniEarnFormContentManage'
import { OmniEarnFormContentOpen } from 'features/omni-kit/sidebars/earn/OmniEarnFormContentOpen'
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
    dynamicMetadata,
  } = useOmniProductContext('earn')

  const {
    elements: { riskSidebar, earnFormOrderAsElement },
    values: { extraDropdownItems },
    handlers: { txSuccessEarnHandler, customReset },
  } = dynamicMetadata('earn')

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
                  updateState('uiPill', 'deposit-earn')
                  updateState('action', 'deposit-earn')
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
                  updateState('uiPill', 'deposit-earn')
                  updateState('action', 'deposit-earn')
                },
              },
              ...extraDropdownItems,
            ],
          },
        })}
      txSuccessAction={() => {
        if (quoteTokenAmount.isZero() || simulation?.quoteTokenAmount.isZero()) {
          updateState('uiPill', 'deposit-earn')
          updateState('action', 'deposit-earn')
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
