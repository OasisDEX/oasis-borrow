import { AjnaPosition } from '@oasisdex/dma-library'
import { LTVWarningThreshold } from 'features/ajna/common/consts'

export const getBorrowishChangeVariant = (simulation?: AjnaPosition) =>
  simulation
    ? simulation.maxRiskRatio.loanToValue
        .minus(simulation.riskRatio.loanToValue)
        .gt(LTVWarningThreshold)
      ? 'positive'
      : 'negative'
    : 'positive'
