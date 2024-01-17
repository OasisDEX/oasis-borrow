import { OmniFormContentTransaction } from 'features/omni-kit/components/sidebars'
import {
  OmniBorrowFormContentDeposit,
  OmniBorrowFormContentManage,
  OmniBorrowFormContentTransition,
  OmniBorrowFormOrder,
} from 'features/omni-kit/components/sidebars/borrow'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { isPoolSupportingMultiply } from 'features/omni-kit/protocols/ajna/helpers'
import {
  OmniBorrowFormAction,
  OmniProductType,
  OmniSidebarBorrowPanel,
  OmniSidebarStep,
} from 'features/omni-kit/types'
import { OmniFormView } from 'features/omni-kit/views'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { circle_close } from 'theme/icons'

export function OmniBorrowFormController({ txHandler }: { txHandler: () => () => void }) {
  const { t } = useTranslation()
  const {
    environment: { collateralIcon, collateralToken, isOpening, networkId, quoteIcon, quoteToken },
    steps: { currentStep },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { uiDropdown },
      updateState,
    },
    dynamicMetadata: {
      elements: { riskSidebar },
    },
  } = useOmniProductContext(OmniProductType.Borrow)

  return (
    <OmniFormView
      {...(!isOpening && {
        dropdown: {
          forcePanel: uiDropdown,
          disabled: currentStep !== OmniSidebarStep.Manage,
          items: [
            {
              label: t('system.manage-collateral-token', {
                token: collateralToken,
              }),
              panel: OmniSidebarBorrowPanel.Collateral,
              shortLabel: collateralToken,
              tokenIcon: collateralIcon,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', OmniSidebarBorrowPanel.Collateral)
                updateState('uiPill', OmniBorrowFormAction.DepositBorrow)
                updateState('action', OmniBorrowFormAction.DepositBorrow)
              },
            },
            {
              label: t('system.manage-debt-token', {
                token: quoteToken,
              }),
              panel: OmniSidebarBorrowPanel.Quote,
              shortLabel: quoteToken,
              tokenIcon: quoteIcon,
              action: () => {
                dispatch({ type: 'reset' })
                updateState('uiDropdown', OmniSidebarBorrowPanel.Quote)
                updateState('uiPill', OmniBorrowFormAction.GenerateBorrow)
                updateState('action', OmniBorrowFormAction.GenerateBorrow)
              },
            },
            // TODO this should be in metadata man
            ...(isPoolSupportingMultiply({ collateralToken, networkId, quoteToken })
              ? [
                  {
                    label: t('system.actions.common.close-position'),
                    icon: circle_close,
                    iconShrink: 2,
                    panel: OmniSidebarBorrowPanel.Close,
                    action: () => {
                      dispatch({ type: 'reset' })
                      updateState('uiDropdown', OmniSidebarBorrowPanel.Close)
                      updateState('closeTo', 'collateral')
                      updateState('action', OmniBorrowFormAction.CloseBorrow)
                    },
                  },
                ]
              : []),
          ],
        },
      })}
      txHandler={txHandler}
      txSuccessAction={() => {
        if (uiDropdown === OmniSidebarBorrowPanel.Close) {
          updateState('uiDropdown', OmniSidebarBorrowPanel.Collateral)
          updateState('action', OmniBorrowFormAction.DepositBorrow)
        }
      }}
    >
      {currentStep === OmniSidebarStep.Risk && riskSidebar}
      {currentStep === OmniSidebarStep.Setup && <OmniBorrowFormContentDeposit />}
      {currentStep === OmniSidebarStep.Manage && <OmniBorrowFormContentManage />}
      {currentStep === OmniSidebarStep.Transition && <OmniBorrowFormContentTransition />}
      {currentStep === OmniSidebarStep.Transaction && (
        <OmniFormContentTransaction orderInformation={OmniBorrowFormOrder} />
      )}
    </OmniFormView>
  )
}
