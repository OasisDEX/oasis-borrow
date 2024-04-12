import type { GasEstimationContext } from 'components/context/GasEstimationContextProvider'
import {
  getOmniTxStatuses,
  type OmniGeneralContextTx,
  shiftOmniStep,
} from 'features/omni-kit/contexts'
import { isShortPosition } from 'features/omni-kit/helpers'
import type {
  RefinanceContextBase,
  RefinanceContextInput,
  RefinanceSteps,
} from 'features/refinance/contexts/RefinanceGeneralContext'
import { getRefinanceFlowStateFilter, getRefinanceValidations } from 'features/refinance/helpers'
import { mapTokenToSdkToken } from 'features/refinance/mapTokenToSdkToken'
import { useRefinanceFormReducto } from 'features/refinance/state'
import { RefinanceSidebarStep } from 'features/refinance/types'
import type { TxDetails } from 'helpers/handleTransaction'
import { useState } from 'react'
import { type AddressValue, getChainInfoByChainId, TokenAmount } from 'summerfi-sdk-common'

const steps = [
  RefinanceSidebarStep.Option,
  RefinanceSidebarStep.Strategy,
  RefinanceSidebarStep.Dpm,
  RefinanceSidebarStep.Give,
  RefinanceSidebarStep.Changes,
  RefinanceSidebarStep.Transaction,
]

export const useInitializeRefinanceContext = ({
  contextInput,
  defaultCtx,
}: {
  contextInput?: RefinanceContextInput
  defaultCtx?: RefinanceContextBase
}) => {
  const [currentStep, setCurrentStep] = useState<RefinanceSidebarStep>(
    defaultCtx?.steps.currentStep || steps[0],
  )
  const [isFlowStateReady, setIsFlowStateReady] = useState<boolean>(
    defaultCtx?.steps.isFlowStateReady || false,
  )

  const [txDetails, setTxDetails] = useState<TxDetails | undefined>(defaultCtx?.tx.txDetails)
  const [gasEstimation, setGasEstimation] = useState<GasEstimationContext | undefined>(
    defaultCtx?.environment.gasEstimation,
  )

  const form = useRefinanceFormReducto({})

  const reset = (resetData: RefinanceContextBase) => {
    setCurrentStep(resetData?.steps.currentStep || steps[0])
    setIsFlowStateReady(resetData?.steps.isFlowStateReady || false)
    setTxDetails(resetData?.tx.txDetails)
    setGasEstimation(resetData?.environment.gasEstimation)

    form.updateState('refinanceOption', resetData?.form.state.refinanceOption)
    form.updateState('strategy', resetData?.form.state.strategy)
    form.updateState('dpmProxy', resetData?.form.state.dpmProxy)
  }

  if (!contextInput) {
    return { ctx: undefined, reset }
  }

  const {
    environment: { tokenPrices, chainId, slippage, address, protocol, productType },
    poolData: { collateralTokenSymbol, debtTokenSymbol, poolId, borrowRate, maxLtv, pairId },
    position: { collateralAmount, debtAmount, liquidationPrice, positionId, ltv },
    automations,
  } = contextInput

  const chainInfo = getChainInfoByChainId(chainId)

  if (!chainInfo) {
    throw new Error(`ChainId ${chainId} is not supported`)
  }

  const collateralTokenData = TokenAmount.createFrom({
    amount: collateralAmount,
    token: mapTokenToSdkToken(chainInfo, collateralTokenSymbol),
  })
  const debtTokenData = TokenAmount.createFrom({
    amount: debtAmount,
    token: mapTokenToSdkToken(chainInfo, debtTokenSymbol),
  })

  const collateralPrice = tokenPrices[collateralTokenData.token.symbol]
  const debtPrice = tokenPrices[debtTokenData.token.symbol]

  // TODO: validate address
  const parsedAddress = address as AddressValue

  const setupStepManager = (): RefinanceSteps => {
    return {
      currentStep,
      steps,
      isExternalStep: [RefinanceSidebarStep.Give, RefinanceSidebarStep.Dpm].includes(currentStep),
      isFlowStateReady,
      isStepWithTransaction: currentStep === RefinanceSidebarStep.Transaction,
      setIsFlowStateReady,
      setStep: (step) => setCurrentStep(step),
      setNextStep: () => shiftOmniStep({ direction: 'next', currentStep, steps, setCurrentStep }),
      setPrevStep: () => shiftOmniStep({ direction: 'prev', currentStep, steps, setCurrentStep }),
    }
  }

  const setupTxManager = (): OmniGeneralContextTx => {
    return {
      ...getOmniTxStatuses(txDetails?.txStatus),
      setTxDetails,
      setSlippageSource: () => null,
      setGasEstimation,
      txDetails,
    }
  }

  const isShort = isShortPosition({ collateralToken: collateralTokenSymbol })

  const ctx: RefinanceContextBase = {
    metadata: {
      flowStateFilter: ({ event, filterConsumed }) =>
        getRefinanceFlowStateFilter({
          event,
          filterConsumed,
          currentProductType: productType,
          formState: form.state,
        }),
      validations: getRefinanceValidations({ state: form.state }),
    },
    environment: {
      contextId: contextInput.contextId,
      collateralPrice,
      debtPrice,
      address: parsedAddress,
      chainInfo,
      slippage,
      isShort,
      gasEstimation,
      protocol,
    },
    position: {
      collateralTokenData,
      debtTokenData,
      liquidationPrice,
      positionId,
      ltv,
    },
    poolData: {
      poolId,
      pairId,
      borrowRate,
      maxLtv,
    },
    automations,
    form,
    steps: setupStepManager(),
    tx: setupTxManager(),
  }

  return { ctx, reset }
}
