import { NetworkIds } from 'blockchain/networks'
import { FlowSidebar } from 'components/FlowSidebar'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { useRefinanceContext } from 'features/refinance/contexts'
import { ChangeOwnerSidebar } from 'features/refinance/controllers'
import { getRefinanceSidebarTitle } from 'features/refinance/helpers'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { useFlowState } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

export const RefinanceFormView: FC = ({ children }) => {
  const { t } = useTranslation()

  const {
    form: {
      state: { refinanceOption },
      updateState,
    },
    steps: { currentStep, isExternalStep, setStep, setNextStep, setPrevStep },
  } = useRefinanceContext()

  const isPrimaryButtonLoading = false
  const isPrimaryButtonHidden = [
    RefinanceSidebarStep.Option,
    RefinanceSidebarStep.Strategy,
  ].includes(currentStep)
  const isTextButtonHidden = currentStep === RefinanceSidebarStep.Option

  const suppressValidation = false
  const isTxSuccess = false
  const isTxInProgress = false
  const isPrimaryButtonDisabled = false
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
    status: undefined,
    withMobilePanel: false,
    disableMaxHeight: currentStep === RefinanceSidebarStep.Strategy,
  }

  const flowState = useFlowState({
    networkId: NetworkIds.MAINNET,
    // ...(dpmProxy && { existingProxy: dpmProxy }),
    amount: zero,
    token: 'ETH',
    filterConsumedProxy: () => Promise.resolve(false),
    onProxiesAvailable: () => null,
    // filterConsumedProxy: (events) => events.every((event) => !flowStateFilter(event)),
    // onProxiesAvailable: (events, dpmAccounts) => {
    //   const filteredEvents = events.filter(flowStateFilter)
    //
    //   if (!hasDupePosition && filteredEvents.length) {
    //     setHasDupePosition(true)
    //     openModal(OmniDupePositionModal, {
    //       collateralAddress,
    //       collateralToken,
    //       dpmAccounts,
    //       events: filteredEvents,
    //       isOracless,
    //       label,
    //       networkId,
    //       productType,
    //       protocol,
    //       pseudoProtocol,
    //       quoteAddress,
    //       quoteToken,
    //       theme,
    //       walletAddress,
    //     })
    //   }
    // },
    onEverythingReady: (data) => {
      updateState('dpmProxy', data.availableProxies[0])
      setNextStep()
    },
    onGoBack: () => setStep(RefinanceSidebarStep.Strategy),
  })

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
          {currentStep === RefinanceSidebarStep.Dpm && <FlowSidebar {...flowState} />}
          {currentStep === RefinanceSidebarStep.Give && (
            <ChangeOwnerSidebar {...changeOwnerProps} />
          )}
        </>
      )}
    </Flex>
  )
}
