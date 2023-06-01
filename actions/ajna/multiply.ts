import {
  AjnaCommonDependencies,
  AjnaCommonPayload,
  AjnaPosition,
  RiskRatio,
  strategies,
} from '@oasisdex/dma-library'
import { AjnaGenericPosition } from 'features/ajna/common/types'
import { AjnaMultiplyFormState } from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto'
import { zero } from 'helpers/zero'

export const ajnaOpenMultiply = ({
  state,
  commonPayload,
  dependencies,
}: {
  state: AjnaMultiplyFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
}) => {
  const { depositAmount, loanToValue } = state

  return strategies.ajna.multiply.open(
    {
      ...commonPayload,
      collateralAmount: depositAmount!,
      riskRatio: new RiskRatio(loanToValue || zero, RiskRatio.TYPE.LTV),
    },
    dependencies,
  )
}

export const ajnaAdjustMultiply = ({
  state,
  commonPayload,
  dependencies,
  position,
}: {
  state: AjnaMultiplyFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  const { loanToValue, depositAmount, withdrawAmount } = state

  return strategies.ajna.multiply.adjust(
    {
      ...commonPayload,
      collateralAmount: depositAmount || withdrawAmount || zero,
      riskRatio: new RiskRatio(
        loanToValue || (position as AjnaPosition).riskRatio.loanToValue,
        RiskRatio.TYPE.LTV,
      ),
      position: position as AjnaPosition,
    },
    dependencies,
  )
}

export const ajnaCloseMultiply = ({
  commonPayload,
  dependencies,
  position,
}: {
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  return strategies.ajna.multiply.close(
    {
      ...commonPayload,
      collateralAmount: zero,
      position: position as AjnaPosition,
      riskRatio: new RiskRatio(zero, RiskRatio.TYPE.LTV),
    },
    dependencies,
  )
}
