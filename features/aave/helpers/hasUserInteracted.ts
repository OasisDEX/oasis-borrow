import { BaseAaveContext } from '../common/BaseAaveContext'

export function hasUserInteracted(state: { context: BaseAaveContext }) {
  // determines whether user inputted value on the aave multiply page
  // returns true if
  // - there is a riskRatio defined - meaning he moved the slider, or there is a position on chain (from protocolData)
  // - there is a simulation in context - meaning riskRatio AND the amount is provided
  return (
    (state.context.userInput.riskRatio?.loanToValue ||
      state.context.protocolData?.position.riskRatio.loanToValue) &&
    state.context.strategy?.simulation.position
  )
}
