import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentRisk } from 'features/ajna/positions/common/sidebars/AjnaFormContentRisk'
import { AjnaFormContentTransaction } from 'features/ajna/positions/common/sidebars/AjnaFormContentTransaction'
import { AjnaFormView } from 'features/ajna/positions/common/views/AjnaFormView'
import { AjnaEarnFormContentManage } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormContentManage'
import { AjnaEarnFormContentOpen } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormContentOpen'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { circle_slider } from 'theme/icons'

export function AjnaEarnFormController() {
  const { t } = useTranslation()
  const {
    environment: { flow, quoteToken, collateralToken, quoteIcon, collateralIcon },
    steps: { currentStep },
  } = useProtocolGeneralContext()
  const {
    form: {
      dispatch,
      state: { uiDropdown },
      updateState,
    },
    position: {
      currentPosition: {
        position: { quoteTokenAmount, collateralTokenAmount },
        simulation,
      },
    },
    staticMetadata,
  } = useGenericProductContext('earn')
  console.log('staticMetadata', staticMetadata)
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
                icon: circle_slider,
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
                tokenIcon: quoteIcon,
                action: () => {
                  dispatch({ type: 'reset' })
                  updateState('uiDropdown', 'liquidity')
                  updateState('uiPill', 'deposit-earn')
                  updateState('action', 'deposit-earn')
                },
              },
              ...(!collateralTokenAmount.isZero()
                ? [
                    {
                      label: t('system.claim-collateral'),
                      panel: 'claim-collateral',
                      shortLabel: collateralToken,
                      tokenIcon: collateralIcon,
                      iconShrink: 2,
                      action: () => {
                        dispatch({ type: 'reset' })
                        updateState('uiDropdown', 'claim-collateral')
                        updateState('action', 'claim-earn')
                      },
                    },
                  ]
                : []),
            ],
          },
        })}
      txSuccessAction={() => {
        if (quoteTokenAmount.isZero() || simulation?.quoteTokenAmount.isZero()) {
          updateState('uiPill', 'deposit-earn')
          updateState('action', 'deposit-earn')
          updateState('uiDropdown', 'adjust')
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
