import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'

/**
 * Utility to calculate the total deposit or withdrawel amounts
 * @param historyEvents
 * @param type
 * @returns
 */
export function calculateTotalDepositWithdrawels(
  historyEvents: VaultHistoryEvent[],
  type: 'WITHDRAW' | 'DEPOSIT',
) {
  const validTypes = type === 'DEPOSIT' ? ['DEPOSIT', 'OPEN'] : ['WITHDRAW']
  const events = historyEvents.filter((event) => validTypes.includes(event.kind))

  let totalDolarAmount = new BigNumber(0)
  let totalEthAmount = new BigNumber(0)

  for (const event of events) {
    if (type === 'WITHDRAW') {
      totalDolarAmount = totalDolarAmount.plus(event.daiAmount || 0)
      console.log(event.collateralAmount?.toString())
      // Multiply by minus one to convert number to positive
      totalEthAmount = new BigNumber(totalEthAmount.plus(event.collateralAmount?.times(-1) || 0))
    } else {
      totalDolarAmount = totalDolarAmount.plus(event.daiAmount || 0)
      totalEthAmount = totalEthAmount.plus(event.collateralAmount || 0)
    }
  }

  return {
    totalDolarAmount,
    totalEthAmount,
  }
}

/**
 * Function to calculate the sum of gas fees for vault history events.
 * @param historyEvents
 * @returns BigNumber
 */
export function calculateTotalGasFeeInEth(historyEvents: VaultHistoryEvent[]) {
  let totalGasFees = new BigNumber(0)

  if (historyEvents) {
    for (const event of historyEvents) {
      console.log(event && event.gasFee?.toString())
      totalGasFees = totalGasFees.plus(event.gasFee || 0)
    }
  }

  return amountFromWei(totalGasFees)
}

export function calculateCurrentPnLInUSD(pnl: BigNumber, netValueUSD: BigNumber) {
  return pnl.times(netValueUSD).dividedBy(pnl.plus(1))
}
