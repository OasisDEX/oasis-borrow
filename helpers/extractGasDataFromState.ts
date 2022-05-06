import { HasGasEstimation } from './form'

export function extractGasDataFromState(state: HasGasEstimation) {
  return {
    gasEstimation: state.gasEstimation,
    gasEstimationUsd: state.gasEstimationUsd,
    gasEstimationEth: state.gasEstimationEth,
    gasEstimationDai: state.gasEstimationDai,
    gasEstimationStatus: state.gasEstimationStatus,
    error: state.error,
  }
}
