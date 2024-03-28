import { useProductContext } from 'components/context/ProductContextProvider'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { getOmniValidations } from 'features/omni-kit/helpers'
import { useOmniInitialization } from 'features/omni-kit/hooks'
import { formatSwapData } from 'features/omni-kit/protocols/ajna/helpers'
import type {
  OmniPositionSet,
  OmniSimulationCommon,
  OmniSimulationSwap,
  ProductContextWithBorrow,
  ProductContextWithEarn,
  ProductContextWithMultiply,
  ProductDetailsContextProviderProps,
} from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import type { PropsWithChildren } from 'react'
import React, { useContext, useMemo } from 'react'

const borrowContext = React.createContext<ProductContextWithBorrow | undefined>(undefined)
const earnContext = React.createContext<ProductContextWithEarn | undefined>(undefined)
const multiplyContext = React.createContext<ProductContextWithMultiply | undefined>(undefined)

type PickProductType<T extends OmniProductType> = T extends OmniProductType.Borrow
  ? ProductContextWithBorrow
  : T extends OmniProductType.Earn
    ? ProductContextWithEarn
    : T extends OmniProductType.Multiply
      ? ProductContextWithMultiply
      : never

export function useOmniProductContext<T extends OmniProductType>(
  productType: T,
): PickProductType<T> {
  const { environment } = useOmniGeneralContext()

  const context =
    productType === OmniProductType.Borrow
      ? useContext(borrowContext)
      : productType === OmniProductType.Earn
        ? useContext(earnContext)
        : useContext(multiplyContext)

  if (productType !== environment.productType)
    throw new Error(
      `OmniGeneralContext and OmniProductContext products doesn't match: ${environment.productType}/${productType}`,
    )
  if (!context) throw new Error('OmniProductContext not available!')
  return context as PickProductType<T>
}

export function OmniProductContextProvider({
  getDynamicMetadata,
  children,
  formDefaults,
  formReducto,
  automationFormReducto,
  automationFormDefaults,
  productType,
  position,
  positionAuction,
  positionHistory,
  positionTriggers,
}: PropsWithChildren<ProductDetailsContextProviderProps>) {
  const { walletAddress } = useAccount()
  const { positionIdFromDpmProxy$ } = useProductContext()

  const {
    environment: {
      collateralBalance,
      collateralPrecision,
      collateralToken,
      entryToken,
      ethBalance,
      ethPrice,
      gasEstimation,
      isOpening,
      protocol,
      quoteBalance,
      quotePrecision,
      quoteToken,
    },
    steps: { currentStep },
    tx: { txDetails },
  } = useOmniGeneralContext()
  // @ts-ignore
  // TODO: find a way to distinguish between the types - there no place for error here except for typescript is too stupid to understand
  const form = formReducto(formDefaults)

  const automationForm = automationFormReducto(automationFormDefaults)
  const {
    automationForms,
    cachedPosition,
    setCachedPosition,
    cachedSwap,
    setCachedSwap,
    simulation,
    setSimulation,
    isSimulationLoading,
    setIsLoadingSimulation,
    automationSimulationData,
    setAutomationSimulationData,
    isAutomationSimulationLoading,
    setAutomationIsLoadingSimulation,
    cachedAutomationOrderInfoItems,
    setCachedAutomationOrderInfoItems,
  } = useOmniInitialization<typeof position>({
    positionTriggers,
  })

  const { state } = form
  const { state: automationState } = automationForm

  const [positionIdFromDpmProxyData] = useObservable(
    useMemo(() => positionIdFromDpmProxy$(state.dpmAddress), [state.dpmAddress]),
  )

  // We need to determine the direction of the swap based on change in position risk
  let isIncreasingPositionRisk = true
  if (simulation && 'riskRatio' in simulation.position && 'riskRatio' in position) {
    isIncreasingPositionRisk = simulation.position.riskRatio.loanToValue.gte(
      position.riskRatio.loanToValue,
    )
  }

  const context = useMemo(() => {
    const fromTokenPrecision = isIncreasingPositionRisk ? quotePrecision : collateralPrecision
    const toTokenPrecision = isIncreasingPositionRisk ? collateralPrecision : quotePrecision

    return {
      form,
      position: {
        simulationCommon: {
          getValidations: getOmniValidations({
            collateralBalance: entryToken.balance,
            collateralToken,
            currentStep,
            ethBalance,
            ethPrice,
            gasEstimationUsd: gasEstimation?.usdValue,
            isOpening,
            position,
            simulation: simulation?.position,
            productType,
            protocol,
            quoteBalance,
            quoteToken,
            simulationErrors: simulation?.errors as OmniSimulationCommon['errors'],
            simulationNotices: simulation?.notices as OmniSimulationCommon['notices'],
            simulationSuccesses: simulation?.successes as OmniSimulationCommon['successes'],
            simulationWarnings: simulation?.warnings as OmniSimulationCommon['warnings'],
            positionTriggers,
            state,
          }),
        },
        setCachedPosition: (positionSet: OmniPositionSet<typeof position>) =>
          setCachedPosition(positionSet),
        setIsLoadingSimulation,
        setSimulation,
        setCachedSwap: (swap: OmniSimulationSwap) => setCachedSwap(swap),
        cachedPosition,
        currentPosition: {
          position,
          simulation: simulation?.position,
        },
        isSimulationLoading,
        resolvedId: positionIdFromDpmProxyData,
        positionAuction,
        swap: {
          current: formatSwapData({
            swapData: simulation?.swaps[0] as OmniSimulationSwap | undefined,
            fromTokenPrecision,
            toTokenPrecision,
          }),
          cached: cachedSwap,
        },
        history: positionHistory,
      },
      automation: {
        positionTriggers,
        automationForms,
        commonForm: automationForm,
        simulationData: automationSimulationData,
        isSimulationLoading: isAutomationSimulationLoading,
        setIsLoadingSimulation: setAutomationIsLoadingSimulation,
        setSimulation: setAutomationSimulationData,
        cachedOrderInfoItems: cachedAutomationOrderInfoItems,
        setCachedOrderInfoItems: setCachedAutomationOrderInfoItems,
      },
    }
  }, [
    cachedPosition,
    collateralBalance,
    currentStep,
    ethBalance,
    ethPrice,
    state,
    isSimulationLoading,
    position,
    positionIdFromDpmProxyData,
    quoteBalance,
    simulation,
    txDetails,
    walletAddress,
    positionHistory,
    cachedSwap,
    positionTriggers,
    automationState,
    automationForms,
    automationSimulationData,
    isAutomationSimulationLoading,
  ])

  switch (productType) {
    case OmniProductType.Borrow:
      return (
        <borrowContext.Provider
          value={
            {
              ...context,
              dynamicMetadata: getDynamicMetadata(context as ProductContextWithBorrow),
            } as ProductContextWithBorrow
          }
        >
          {children}
        </borrowContext.Provider>
      )
    case OmniProductType.Earn:
      return (
        <earnContext.Provider
          value={
            {
              ...context,
              dynamicMetadata: getDynamicMetadata(context as ProductContextWithEarn),
            } as ProductContextWithEarn
          }
        >
          {children}
        </earnContext.Provider>
      )
    case OmniProductType.Multiply:
      return (
        <multiplyContext.Provider
          value={
            {
              ...context,
              dynamicMetadata: getDynamicMetadata(context as ProductContextWithMultiply),
            } as ProductContextWithMultiply
          }
        >
          {children}
        </multiplyContext.Provider>
      )
  }
}
