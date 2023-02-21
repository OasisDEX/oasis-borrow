import { getAjnaBorrowParameters } from 'actions/ajna'
import { Context } from 'blockchain/network'
import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { initializeAjnaTxHandler } from 'features/ajna/common/initializeAjnaTxHandler'
import { AjnaTxHandler } from 'features/ajna/common/types'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'

export function useAjnaBorrowTxHandler(): AjnaTxHandler {
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
  } = useAjnaBorrowContext()

  const { depositAmount, generateAmount, paybackAmount, withdrawAmount, dpmAddress } = state

  const dependencyArray = [
    depositAmount?.toString(),
    generateAmount?.toString(),
    paybackAmount?.toString(),
    withdrawAmount?.toString(),
  ]

  const simulationCondition = !depositAmount && !generateAmount && !paybackAmount && !withdrawAmount

  function getAjnaParametersCallback(context: Context) {
    return getAjnaBorrowParameters({
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
