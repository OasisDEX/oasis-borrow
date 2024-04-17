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
import { positionTypeToOmniProductType } from 'features/refinance/helpers/positionTypeToOmniProductType'
import { mapTokenToSdkToken } from 'features/refinance/mapTokenToSdkToken'
import { useRefinanceFormReducto } from 'features/refinance/state'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { useAppConfig } from 'helpers/config'
import type { TxDetails } from 'helpers/handleTransaction'
import { useState } from 'react'
import { type AddressValue, TokenAmount } from 'summerfi-sdk-common'

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
}): {
  ctx: RefinanceContextBase | undefined
  reset: (resetData: RefinanceContextBase) => void
} => {
  const {
    RefinanceSafetySwitch: isSafetySwitchEnabled,
    RefinanceSuppressValidation: isSuppressValidationEnabled,
  } = useAppConfig('features')
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
    form.updateState('dpm', resetData?.form.state.dpm)
  }

  if (!contextInput) {
    return { ctx: undefined, reset }
  }

  const {
    environment: { tokenPrices, slippage, address, isOwner },
    poolData: { collateralTokenSymbol, debtTokenSymbol, poolId, borrowRate, maxLtv, pairId },
    position: {
      collateralAmount,
      debtAmount,
      liquidationPrice,
      positionId,
      ltv,
      positionType: type,
      lendingProtocol,
    },
    automations,
  } = contextInput

  const chainInfo = poolId.protocol.chainInfo

  const collateralTokenData = TokenAmount.createFrom({
    amount: collateralAmount,
    token: mapTokenToSdkToken(chainInfo, collateralTokenSymbol),
  })
  const debtTokenData = TokenAmount.createFrom({
    amount: debtAmount,
    token: mapTokenToSdkToken(chainInfo, debtTokenSymbol),
  })

  const collateralPrice = tokenPrices[collateralTokenSymbol]
  const debtPrice = tokenPrices[debtTokenSymbol]
  const ethPrice = tokenPrices['ETH']

  const parsedAddress = address as AddressValue

  const setupStepManager = (): RefinanceSteps => {
    return {
      currentStep,
      steps,
      isExternalStep: [RefinanceSidebarStep.Dpm].includes(currentStep),
      isFlowStateReady,
      isStepWithTransaction: [RefinanceSidebarStep.Give, RefinanceSidebarStep.Changes].includes(
        currentStep,
      ),
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
  if (!type) {
    throw new Error('Unsupported position type')
  }
  const currentProductType = positionTypeToOmniProductType(type)

  const ctx: RefinanceContextBase = {
    metadata: {
      flowStateFilter: ({ event, filterConsumed }) =>
        getRefinanceFlowStateFilter({
          event,
          filterConsumed,
          currentProductType,
          formState: form.state,
        }),
      validations: getRefinanceValidations({ state: form.state }),
      safetySwitch: isSafetySwitchEnabled,
      suppressValidation: isSuppressValidationEnabled,
    },
    environment: {
      contextId: contextInput.contextId,
      collateralPrice,
      debtPrice,
      ethPrice,
      address: parsedAddress,
      chainInfo,
      slippage,
      gasEstimation,
      isOwner,
    },
    position: {
      collateralTokenData,
      debtTokenData,
      liquidationPrice,
      positionId,
      ltv,
      positionType: type,
      isShort,
      lendingProtocol,
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
