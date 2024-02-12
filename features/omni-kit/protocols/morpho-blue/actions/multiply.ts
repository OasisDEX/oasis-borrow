import type {
  MorphoAdjustMultiplyPayload,
  MorphoCloseMultiplyPayload,
  MorphoMultiplyDependencies,
  MorphoOpenMultiplyPayload,
} from '@oasisdex/dma-library'
import { RiskRatio, strategies } from '@oasisdex/dma-library'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import { zero } from 'helpers/zero'

export const morphoActionOpenMultiply = ({
  state,
  commonPayload,
  dependencies,
}: {
  state: OmniMultiplyFormState
  commonPayload: MorphoOpenMultiplyPayload
  dependencies: MorphoMultiplyDependencies
}) => {
  const { depositAmount, loanToValue } = state

  return strategies.morphoblue.multiply.open(
    {
      ...commonPayload,
      collateralAmount: depositAmount || zero,
      riskRatio: new RiskRatio(loanToValue || zero, RiskRatio.TYPE.LTV),
    },
    dependencies,
  )
}

export const morphoActionAdjust = ({
  commonPayload,
  dependencies,
}: {
  commonPayload: MorphoAdjustMultiplyPayload
  dependencies: MorphoMultiplyDependencies
}) => {
  return strategies.morphoblue.multiply.adjust(commonPayload, dependencies)
}

export const morphoActionClose = ({
  commonPayload,
  dependencies,
}: {
  commonPayload: MorphoCloseMultiplyPayload
  dependencies: MorphoMultiplyDependencies
}) => {
  return strategies.morphoblue.multiply.close(commonPayload, dependencies)
}
