import { type AddressValue, TokenAmount } from '@summer_fi/summerfi-sdk-common'
import { getTokenPrice } from 'blockchain/prices'
import { tokenPriceStore } from 'blockchain/prices.constants'
import type { GasEstimationContext } from 'components/context/GasEstimationContextProvider'
import {
  getOmniTxStatuses,
  type OmniGeneralContextTx,
  shiftOmniStep,
} from 'features/omni-kit/contexts'
import { isShortPosition } from 'features/omni-kit/helpers'
import { refinanceMakerSteps, refinanceStepsWithoutDpm } from 'features/refinance/constants'
import type {
  RefinanceContextInput,
  RefinanceGeneralContextBase,
  RefinanceSteps,
} from 'features/refinance/contexts/RefinanceGeneralContext'
import { getRefinanceValidations } from 'features/refinance/helpers'
import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'
import { useRefinanceFormReducto } from 'features/refinance/state'
import type { DpmRefinanceFormState } from 'features/refinance/state/refinanceFormReducto.types'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { useAppConfig } from 'helpers/config'
import type { TxDetails } from 'helpers/handleTransaction'
import { LendingProtocol } from 'lendingProtocols'
import { useState } from 'react'

export const useInitializeRefinanceContextBase = ({
  contextInput,
  defaultCtx,
}: {
  contextInput?: RefinanceContextInput
  defaultCtx?: RefinanceGeneralContextBase
}): {
  ctx: RefinanceGeneralContextBase | undefined
  reset: (resetData: RefinanceGeneralContextBase, defaultDpm?: DpmRefinanceFormState) => void
} => {
  const {
    RefinanceSafetySwitch: isSafetySwitchEnabled,
    RefinanceSuppressValidation: isSuppressValidationEnabled,
  } = useAppConfig('features')
  const [currentStep, setCurrentStep] = useState<RefinanceSidebarStep>(
    defaultCtx?.steps.currentStep || RefinanceSidebarStep.Option,
  )
  const [isFlowStateReady, setIsFlowStateReady] = useState<boolean>(
    defaultCtx?.steps.isFlowStateReady || false,
  )

  const [txDetails, setTxDetails] = useState<TxDetails | undefined>(defaultCtx?.tx.txDetails)
  const [gasEstimation, setGasEstimation] = useState<GasEstimationContext | undefined>(
    defaultCtx?.environment.gasEstimation,
  )

  const form = useRefinanceFormReducto({})

  const reset = (resetData: RefinanceGeneralContextBase, defaultDpm?: DpmRefinanceFormState) => {
    setCurrentStep(resetData?.steps.currentStep || RefinanceSidebarStep.Option)
    setIsFlowStateReady(resetData?.steps.isFlowStateReady || false)
    setTxDetails(resetData?.tx.txDetails)
    setGasEstimation(resetData?.environment.gasEstimation)

    form.updateState('refinanceOption', resetData?.form.state.refinanceOption)
    form.updateState('strategy', resetData?.form.state.strategy)
    form.updateState('dpm', defaultDpm)
  }

  if (!contextInput) {
    return { ctx: undefined, reset }
  }

  const steps = {
    [LendingProtocol.Maker]: refinanceMakerSteps,
    [LendingProtocol.AaveV3]: refinanceStepsWithoutDpm,
    [LendingProtocol.SparkV3]: refinanceStepsWithoutDpm,
    [LendingProtocol.MorphoBlue]: refinanceStepsWithoutDpm,
    // not handled
    [LendingProtocol.AaveV2]: [],
    [LendingProtocol.Ajna]: [],
    [LendingProtocol.Sky]: [],
  }[contextInput.position.lendingProtocol]

  const getTokenUsdPrice = (symbol: string) =>
    getTokenPrice(
      symbol.toUpperCase(),
      tokenPriceStore.prices,
      'getTokenUsdPrice - init refinance context base',
    ).toString()

  const {
    environment: { slippage, address, isOwner },
    poolData: { collateralTokenSymbol, debtTokenSymbol, poolId, maxLtv, pairId },
    position: {
      collateralAmount,
      debtAmount,
      liquidationPrice,
      positionId,
      ltv,
      positionType: type,
      lendingProtocol,
      borrowRate,
      supplyRate,
      protocolPrices,
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

  const collateralPrice = protocolPrices[collateralTokenSymbol]
  const debtPrice = protocolPrices[debtTokenSymbol]
  const ethPrice = protocolPrices['ETH']

  const parsedAddress = address as AddressValue

  const setupStepManager = (): RefinanceSteps => {
    return {
      currentStep,
      steps,
      isExternalStep: [RefinanceSidebarStep.Dpm].includes(currentStep),
      isFlowStateReady,
      isStepWithTransaction: [RefinanceSidebarStep.Import, RefinanceSidebarStep.Changes].includes(
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

  if (!type) {
    throw new Error('Unsupported position type')
  }

  const isShort = isShortPosition({ collateralToken: collateralTokenSymbol })

  const ctx: RefinanceGeneralContextBase = {
    metadata: {
      validations: getRefinanceValidations({ state: form.state }),
      safetySwitch: isSafetySwitchEnabled,
      suppressValidation: isSuppressValidationEnabled,
    },
    environment: {
      contextId: contextInput.contextId,
      address: parsedAddress,
      chainInfo,
      slippage,
      gasEstimation,
      isOwner,
      getTokenUsdPrice,
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
      borrowRate: borrowRate,
      supplyRate: supplyRate,
      protocolPrices: {
        collateralPrice,
        debtPrice,
        ethPrice,
      },
    },
    poolData: {
      poolId,
      pairId,
      maxLtv,
    },
    automations,
    form,
    steps: setupStepManager(),
    tx: setupTxManager(),
  }

  return { ctx, reset }
}
