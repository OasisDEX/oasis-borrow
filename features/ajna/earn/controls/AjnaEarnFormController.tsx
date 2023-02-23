import { getToken } from 'blockchain/tokensMetadata'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import { AjnaFormContentRisk } from 'features/ajna/common/sidebars/AjnaFormContentRisk'
import { AjnaFormContentTransaction } from 'features/ajna/common/sidebars/AjnaFormContentTransaction'
import { AjnaFormView } from 'features/ajna/common/views/AjnaFormView'
import { AjnaEarnFormContentManage } from 'features/ajna/earn/sidebars/AjnaEarnFormContentManage'
import { AjnaEarnFormContentOpen } from 'features/ajna/earn/sidebars/AjnaEarnFormContentOpen'
import { AjnaEarnFormOrder } from 'features/ajna/earn/sidebars/AjnaEarnFormOrder'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormController() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, flow },
    steps: { currentStep },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { uiDropdown },
      updateState,
    },
  } = useAjnaProductContext('earn')

  return (
    <AjnaFormView
      {...(flow === 'manage' && {
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
              },
            },
            {
              label: t('system.manage-liquidity', {
                token: collateralToken,
              }),
              panel: 'collateral',
              shortLabel: collateralToken,
              icon: getToken(collateralToken).iconCircle,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', 'collateral')
                updateState('uiPill', 'deposit-earn')
              },
            },
          ],
        },
      })}
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
