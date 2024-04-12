import { getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { getOmniSidebarTransactionStatus } from 'features/omni-kit/helpers'
import { useRefinanceContext } from 'features/refinance/contexts'
import { ChangeOwnerSidebar, RefinanceFlowSidebarController } from 'features/refinance/controllers'
import { getRefinanceNewProductType, getRefinanceSidebarTitle } from 'features/refinance/helpers'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

export const RefinanceFormView: FC = ({ children }) => {
  const { t } = useTranslation()

  const {
    metadata: {
      validations: { hasErrors },
    },
    environment: {
      chainInfo: { chainId },
      protocol,
    },
    position: { collateralTokenData, debtTokenData, productType: currentType },
    tx: { isTxSuccess, isTxInProgress, txDetails },
    form: {
      state: { refinanceOption },
      updateState,
    },
    steps: { currentStep, isExternalStep, setStep, setNextStep, setPrevStep },
  } = useRefinanceContext()

  const isPrimaryButtonLoading = isTxInProgress
  const isPrimaryButtonHidden = [
    RefinanceSidebarStep.Option,
    RefinanceSidebarStep.Strategy,
  ].includes(currentStep)
  const isTextButtonHidden = currentStep === RefinanceSidebarStep.Option

  const suppressValidation = false
  const isPrimaryButtonDisabled = hasErrors
  const primaryButtonLabel = t('confirm')
  const sidebarTitle = getRefinanceSidebarTitle({ currentStep, t, option: refinanceOption })
  const textButtonAction = () => {
    if (currentStep === RefinanceSidebarStep.Changes) {
      updateState('strategy', undefined)
      setStep(RefinanceSidebarStep.Strategy)
    } else {
      setPrevStep()
    }
  }
  const primaryButtonActions = {
    // eslint-disable-next-line no-console
    action: () => console.log('click'),
  }

  const productType = refinanceOption
    ? getRefinanceNewProductType({ currentType, refinanceOption })
    : currentType

  const contracts = getNetworkContracts(chainId as NetworkIds)

  const status = getOmniSidebarTransactionStatus({
    etherscan: contracts && 'etherscan' in contracts ? contracts.etherscan.url : undefined,
    etherscanName: contracts && 'etherscan' in contracts ? contracts.etherscan.name : undefined,
    isTxInProgress,
    isTxSuccess,
    text: t(
      isTxSuccess
        ? `omni-kit.form.transaction.success-${'open'}`
        : `omni-kit.form.transaction.progress-${'open'}`,
      {
        collateralToken: collateralTokenData.token,
        quoteToken: debtTokenData.token,
        productType,
        protocol: LendingProtocolLabel[protocol],
      },
    ),
    txDetails,
  })

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
      label: t('go-back'),
      action: textButtonAction,
      hidden: isTxInProgress || isTxSuccess || isTextButtonHidden,
    },
    status,
    withMobilePanel: false,
    disableMaxHeight: currentStep === RefinanceSidebarStep.Strategy,
  }

  const changeOwnerProps = {
    textButtonAction: () => setStep(RefinanceSidebarStep.Strategy),
    onEverythingReady: () => setNextStep(),
  }

  return (
    <Flex sx={{ flex: 1 }}>
      {!isExternalStep ? (
        <SidebarSection {...sidebarSectionProps} />
      ) : (
        <>
          {currentStep === RefinanceSidebarStep.Dpm && <RefinanceFlowSidebarController />}
          {currentStep === RefinanceSidebarStep.Give && (
            <ChangeOwnerSidebar {...changeOwnerProps} />
          )}
        </>
      )}
    </Flex>
  )
}
