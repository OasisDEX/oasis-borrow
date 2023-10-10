import type { AjnaPosition } from '@oasisdex/dma-library'
import { LTVWarningThreshold } from 'features/ajna/common/consts'

export const getBorrowishChangeVariant = ({
  isOracless,
  simulation,
}: {
  isOracless: boolean
  simulation?: AjnaPosition
}) =>
  simulation
    ? isOracless
      ? 'positive'
      : simulation.maxRiskRatio.loanToValue
          .minus(simulation.riskRatio.loanToValue)
          .gt(LTVWarningThreshold)
      ? 'positive'
      : 'negative'
    : 'positive'
