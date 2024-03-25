import BigNumber from 'bignumber.js'
import { ethNullAddress } from 'blockchain/networks'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { zero } from 'helpers/zero'

export const getRealizedProfit = (events: PositionHistoryEvent[]) => {
  const eventsDefault = {
    collateralToken: zero,
    debtToken: zero,
  } as const
  return (
    events
      // example: "AutomationExecuted-DmaAavePartialTakeProfitV2"
      .filter(({ kind }) => kind?.includes('PartialTakeProfit'))
      .filter(({ kind }) => kind?.includes('AutomationExecuted'))
      .reduce((acc, event) => {
        if (!event.withdrawTransfers?.length) {
          return acc
        }
        const newTransfersRealized = { ...acc }
        event.withdrawTransfers?.forEach((transfer) => {
          if (!transfer.amount.isZero() && event.collateralAddress && event.debtAddress) {
            const collateralTokenAddress =
              event.collateralToken === 'WETH'
                ? ethNullAddress.toLocaleLowerCase()
                : event.collateralAddress.toLocaleLowerCase()
            const debtTokenAddress =
              event.debtToken === 'WETH'
                ? ethNullAddress.toLocaleLowerCase()
                : event.debtAddress.toLocaleLowerCase()
            const isCollateralTokenTransfer =
              transfer.token.toLocaleLowerCase() === collateralTokenAddress
            const isDebtTokenTransfer = transfer.token.toLocaleLowerCase() === debtTokenAddress
            if (isCollateralTokenTransfer) {
              newTransfersRealized.collateralToken = newTransfersRealized.collateralToken.plus(
                new BigNumber(transfer.amount),
              )
            }
            if (isDebtTokenTransfer) {
              newTransfersRealized.debtToken = newTransfersRealized.debtToken.plus(
                new BigNumber(transfer.amount),
              )
            }
          }
        })
        return newTransfersRealized
      }, eventsDefault) as Record<'debtToken' | 'collateralToken', BigNumber>
  )
}
