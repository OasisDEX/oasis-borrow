import type BigNumber from 'bignumber.js'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { zero } from 'helpers/zero'

export const getRealizedProfit = (events: PositionHistoryEvent[]) => {
  return (
    events
      // example: "AutomationExecuted-DmaAavePartialTakeProfitV2"
      .filter(({ kind }) => kind?.includes('PartialTakeProfit'))
      .filter(({ kind }) => kind?.includes('AutomationExecuted'))
      .reduce(
        (acc, event) => {
          return {
            debtRealized: (acc.debtRealized || zero).plus(event.debtDelta?.abs() || zero),
            collateralRealized: (acc.collateralRealized || zero).plus(
              event.collateralDelta?.abs() || zero,
            ),
          }
        },
        {
          debtRealized: zero,
          collateralRealized: zero,
        },
      ) as {
      debtRealized: BigNumber
      collateralRealized: BigNumber
    }
  )
}
