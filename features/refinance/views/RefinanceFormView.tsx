import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

export const RefinanceFormView: FC = ({ children }) => {
  const { t } = useTranslation()

  const isPrimaryButtonLoading = false
  const isPrimaryButtonHidden = true
  const isTextButtonHidden = true

  const suppressValidation = false
  const isTxSuccess = false
  const isTxInProgress = false
  const isPrimaryButtonDisabled = false
  const primaryButtonLabel = t('confirm')
  const sidebarTitle = t('refinance.sidebar.why-refinance.title')
  // eslint-disable-next-line no-console
  const textButtonAction = () => console.log('click')
  const primaryButtonActions = {
    // eslint-disable-next-line no-console
    action: () => console.log('click'),
  }
  const isExternalStep = false

  const sidebarSectionProps: SidebarSectionProps = {
    title: sidebarTitle,
    content: <Grid gap={3}>{children}</Grid>,
    primaryButton: {
      label: t(primaryButtonLabel),
      disabled: suppressValidation || isTxSuccess ? false : isPrimaryButtonDisabled,
      isLoading: isPrimaryButtonLoading,
      hidden: isPrimaryButtonHidden,
      withoutNextLink: true,
      ...primaryButtonActions,
    },
    textButton: {
      label: t('back-to-editing'),
      action: textButtonAction,
      hidden: isTxInProgress || isTxSuccess || isTextButtonHidden,
    },
    status: undefined,
    withMobilePanel: false,
    disableMaxHeight: true,
  }

  return (
    <Flex sx={{ flex: 1 }}>
      {!isExternalStep ? (
        <SidebarSection {...sidebarSectionProps} />
      ) : (
        <>TBD</>
        // <>{currentStep === OmniSidebarStep.Dpm && <FlowSidebar {...flowState} />}</>
      )}
    </Flex>
  )
}
