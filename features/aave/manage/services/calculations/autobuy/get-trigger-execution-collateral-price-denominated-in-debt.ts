import type { AutoBuyTriggerAaveContext } from 'features/aave/manage/state'

export const getTriggerExecutionCollateralPriceDenominatedInDebt = ({
  position,
  executionTriggerLTV,
}: Pick<AutoBuyTriggerAaveContext, 'position' | 'executionTriggerLTV'>) => {
  if (!position || !executionTriggerLTV) {
    return undefined
  }

  return position.debt.amount.div(position.collateral.amount.times(executionTriggerLTV / 100))
}
