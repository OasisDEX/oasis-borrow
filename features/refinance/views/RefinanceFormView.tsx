import { getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { getNetworkById, getNetworkByName } from 'blockchain/networks'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { getOmniSidebarTransactionStatus } from 'features/omni-kit/helpers'
import { useRefinanceContext } from 'features/refinance/contexts'
import { RefinanceFlowSidebarController } from 'features/refinance/controllers'
import {
  getRefinanceNewProductType,
  getRefinancePrimaryButtonLabelKey,
  getRefinanceSidebarPrimaryButtonActions,
  getRefinanceSidebarTitle,
  getRefinanceStatusCopy,
  getRefinanceStepCounter,
} from 'features/refinance/helpers'
import { getRefinanceSidebarButtonsStatus } from 'features/refinance/helpers/getRefinanceSidebarButtonStatus'
import { positionTypeToOmniProductType } from 'features/refinance/helpers/positionTypeToOmniProductType'
import { useRefinanceTxHandler } from 'features/refinance/hooks'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { getPairIdFromLabel } from 'helpers/getPairIdFromLabel'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

export const RefinanceFormView: FC = ({ children }) => {
  const { t } = useTranslation()
  const { connect, setChain } = useConnection()
  const { walletAddress, chainId: walletChainId } = useAccount()

  const {
    metadata: {
      validations: { hasErrors },
      safetySwitch,
      suppressValidation,
    },
    environment: {
      chainInfo: { chainId },
      isOwner,
    },
    position: { collateralTokenData, debtTokenData, positionType, lendingProtocol },
    tx: { isTxSuccess, isTxInProgress, txDetails, setTxDetails, isTxWaitingForApproval, isTxError },
    form: {
      state: { refinanceOption, strategy, dpm },
      updateState,
    },
    steps: {
      currentStep,
      isExternalStep,
      isStepWithTransaction,
      setStep,
      setNextStep,
      setPrevStep,
    },
  } = useRefinanceContext()

  const txHandler = useRefinanceTxHandler()

  const isSimulationLoading = txHandler === null

  const shouldSwitchNetwork = chainId !== walletChainId

  const primaryButtonLabel = getRefinancePrimaryButtonLabelKey({
    currentStep,
    isTxSuccess,
    isTxError,
    walletAddress,
    shouldSwitchNetwork,
  })
  const sidebarTitle = getRefinanceSidebarTitle({ currentStep, t, option: refinanceOption })

  const textButtonAction = () => {
    if ([RefinanceSidebarStep.Changes, RefinanceSidebarStep.Give].includes(currentStep)) {
      updateState('strategy', undefined)
      setTxDetails(undefined)
      setStep(RefinanceSidebarStep.Strategy)
    } else {
      setPrevStep()
    }
  }

  const {
    isPrimaryButtonLoading,
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isTextButtonHidden,
  } = getRefinanceSidebarButtonsStatus({
    currentStep,
    hasErrors,
    isOwner,
    isSimulationLoading,
    isTxInProgress,
    isTxSuccess,
    isTxWaitingForApproval,
    safetySwitch,
    shouldSwitchNetwork,
    walletAddress,
    suppressValidation,
  })

  if (!positionType) {
    throw new Error('Unsupported position type')
  }
  const currentType = positionTypeToOmniProductType(positionType)

  const productType = refinanceOption
    ? getRefinanceNewProductType({ currentType, refinanceOption })
    : currentType

  const currentNetwork = getNetworkById(chainId)
  const network = getNetworkByName(strategy?.network || currentNetwork.name)
  const protocol = strategy?.protocol || lendingProtocol

  const primaryButtonActions = getRefinanceSidebarPrimaryButtonActions({
    collateralAddress: strategy?.primaryTokenAddress || collateralTokenData.token.address.value,
    collateralToken: strategy?.primaryToken || collateralTokenData.token.symbol,
    currentStep,
    editingStep: RefinanceSidebarStep.Option,
    isStepWithTransaction,
    isTxSuccess,
    label: strategy?.label,
    network,
    onDefault: setNextStep,
    onDisconnected: connect,
    onSelectTransition: txHandler,
    onUpdated: () => {
      if (currentStep === RefinanceSidebarStep.Give) {
        setTxDetails(undefined)
        setNextStep()
      }
    },
    onSwitchNetwork: () => setChain(`0x${chainId}`),
    pairId: getPairIdFromLabel(strategy?.label),
    productType,
    protocol,
    quoteAddress: strategy?.secondaryTokenAddress || debtTokenData.token.address.value,
    quoteToken: strategy?.secondaryToken || debtTokenData.token.symbol,
    shouldSwitchNetwork,
    openFlowResolvedDpmId: dpm?.id,
    walletAddress,
  })

  const contracts = getNetworkContracts(chainId as NetworkIds)

  const status = getOmniSidebarTransactionStatus({
    etherscan: contracts && 'etherscan' in contracts ? contracts.etherscan.url : undefined,
    etherscanName: contracts && 'etherscan' in contracts ? contracts.etherscan.name : undefined,
    isTxInProgress,
    isTxSuccess,
    text: getRefinanceStatusCopy({
      currentStep,
      protocol: strategy?.protocol,
      collateralToken: collateralTokenData.token.symbol,
      quoteToken: debtTokenData.token.symbol,
      productType,
      isTxSuccess,
      t,
    }),
    txDetails,
  })

  const sidebarSectionProps: SidebarSectionProps = {
    title: sidebarTitle,
    content: <Grid gap={3}>{children}</Grid>,
    primaryButton: {
      label: t(primaryButtonLabel),
      disabled: isPrimaryButtonDisabled,
      isLoading: isPrimaryButtonLoading,
      hidden: isPrimaryButtonHidden,
      withoutNextLink: true,
      ...primaryButtonActions,
    },
    status,
    withMobilePanel: false,
    disableMaxHeight: currentStep === RefinanceSidebarStep.Strategy,
    cardSx: {
      height: 'fit-content',
    },
    headerBackButton: {
      action: textButtonAction,
      hidden: isTextButtonHidden,
    },
    step: getRefinanceStepCounter({ currentStep }),
  }

  return (
    <Flex sx={{ flex: 1 }}>
      {!isExternalStep ? (
        <SidebarSection {...sidebarSectionProps} />
      ) : (
        <>{currentStep === RefinanceSidebarStep.Dpm && <RefinanceFlowSidebarController />}</>
      )}
    </Flex>
  )
}
