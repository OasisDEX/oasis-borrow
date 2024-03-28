import type { LendingPosition } from '@oasisdex/dma-library'
import { LTVWarningThreshold } from 'features/omni-kit/protocols/ajna/constants'

export const getOmniBorrowishChangeVariant = ({
  isOracless,
  simulation,
}: {
  isOracless: boolean
  simulation?: LendingPosition
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
