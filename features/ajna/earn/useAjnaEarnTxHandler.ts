import { getAjnaEarnParameters } from 'actions/ajna'
import { Context } from 'blockchain/network'
import { initializeAjnaTxHandler } from 'features/ajna/common/initializeAjnaTxHandler'
import { AjnaTxHandler } from 'features/ajna/common/types'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { useAjnaEarnContext } from 'features/ajna/earn/contexts/AjnaEarnContext'

export function useAjnaEarnTxHandler(): AjnaTxHandler {
  const {
    environment: { collateralToken, quoteToken },
  } = useAjnaProductContext()

  const {
    form: { dispatch, state },
    position: {
      currentPosition: { position, simulation },
      setCachedPosition,
      setIsLoadingSimulation,
      setSimulation,
    },
  } = useAjnaEarnContext()

  const { depositAmount, priceBucketUSD, withdrawAmount, dpmAddress } = state

  const dependencyArray = [
    depositAmount?.toString(),
    priceBucketUSD?.toString(),
    withdrawAmount?.toString(),
  ]

  const simulationCondition = !depositAmount && !priceBucketUSD && !withdrawAmount

  function getAjnaParametersCallback(context: Context) {
    return getAjnaEarnParameters({
      rpcProvider: context.rpcProvider,
      formState: state,
      collateralToken,
      quoteToken,
      context,
      position,
    })
  }

  return initializeAjnaTxHandler({
    setCachedPosition,
    dependencyArray,
    getAjnaParametersCallback,
    position,
    simulation,
    setSimulation,
    simulationCondition,
    setIsLoadingSimulation,
    dispatch,
    dpmAddress,
  })
}
