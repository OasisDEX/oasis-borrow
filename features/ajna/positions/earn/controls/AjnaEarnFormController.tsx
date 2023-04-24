import { getToken } from 'blockchain/tokensMetadata'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentRisk } from 'features/ajna/positions/common/sidebars/AjnaFormContentRisk'
import { AjnaFormContentTransaction } from 'features/ajna/positions/common/sidebars/AjnaFormContentTransaction'
import { AjnaFormView } from 'features/ajna/positions/common/views/AjnaFormView'
import { AjnaEarnFormContentManage } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormContentManage'
import { AjnaEarnFormContentOpen } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormContentOpen'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormController() {
  const { t } = useTranslation()
  const {
    environment: { flow, quoteToken },
    steps: { currentStep },
  } = useAjnaGeneralContext()
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
  } = useAjnaProductContext('earn')

  return (
    <AjnaFormView
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
                icon: 'circle_slider',
                iconShrink: 2,
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiDropdown', 'adjust')
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
                icon: getToken(quoteToken).iconCircle,
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiDropdown', 'liquidity')
                  updateState('uiPill', 'deposit-earn')
                  updateState('action', 'deposit-earn')
                },
              },
            ],
          },
        })}
      txSuccessAction={() => {
        if (quoteTokenAmount.isZero() || simulation?.quoteTokenAmount.isZero()) {
          updateState('uiPill', 'deposit-earn')
          updateState('action', 'deposit-earn')
        }
      }}
    >
      {currentStep === 'risk' && <AjnaFormContentRisk />}
      {currentStep === 'setup' && <AjnaEarnFormContentOpen />}
      {currentStep === 'manage' && <AjnaEarnFormContentManage />}
      {currentStep === 'transaction' && (
        <AjnaFormContentTransaction orderInformation={AjnaEarnFormOrder} />
      )}
    </AjnaFormView>
  )
}
