import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import { formatAmount } from 'helpers/formatters/format'

/**
 * Utility to calculate the total deposit or withdrawel amounts
 * @param historyEvents
 * @param type
 * @returns
 */
export function calculateTotalDepositWithdrawals(
  historyEvents: VaultHistoryEvent[],
  type: 'WITHDRAW' | 'DEPOSIT',
) {
  const validDepositEvents =
    type === 'DEPOSIT'
      ? ['DEPOSIT', 'OPEN_MULTIPLY_VAULT', 'DEPOSIT-GENERATE', 'INCREASE_MULTIPLE']
      : ['WITHDRAW', 'DECREASE_MULTIPLE']
  const events = historyEvents.filter((event) => validDepositEvents.includes(event.kind))

  // Calculate the total eth amount
  const totalEthAmount =
    events.length &&
    (events
      .map((event) => {
        if (['OPEN_MULTIPLY_VAULT', 'INCREASE_MULTIPLE'].includes(event.kind)) {
          return event.depositCollateral
        } else if (type === 'WITHDRAW') {
          // convert to a positive number
          return event.kind === 'DECREASE_MULTIPLE'
            ? event.withdrawnCollateral
            : event.collateralAmount?.times(-1)
        } else {
          return event.collateralAmount
        }
      })
      ?.reduce((value, totalAmount) => totalAmount?.plus(value || 0)) as BigNumber)

  // Calculate the total dollar amount
  const totalDollarAmount =
    events.length &&
    (events
      .map((event) => {
        if (['OPEN_MULTIPLY_VAULT', 'INCREASE_MULTIPLE'].includes(event.kind)) {
          const ethDeposited = event.depositCollateral || new BigNumber(0)
          const ethPrice = event.ethPrice

          return ethDeposited.times(ethPrice)
        } else if (type === 'WITHDRAW') {
          // convert to a positive number
          const withdrawAmount =
            event.kind === 'DECREASE_MULTIPLE'
              ? event.withdrawnCollateral
              : (event.collateralAmount?.times(-1) as BigNumber)

          return withdrawAmount.times(event.ethPrice)
        } else {
          return event.collateralAmount?.times(event.ethPrice)
        }
      })
      ?.reduce((value, totalAmount) => totalAmount?.plus(value || 0)) as BigNumber)

  return {
    totalDollarAmount,
    totalEthAmount,
  } as {
    totalDollarAmount: BigNumber
    totalEthAmount: BigNumber
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
      totalGasFees = totalGasFees.plus(event.gasFee || 0)
    }
  }

  return amountFromWei(totalGasFees)
}

export function calculateCurrentPnLInUSD(pnl: BigNumber, netValueUSD: BigNumber) {
  return pnl.times(netValueUSD).dividedBy(pnl.plus(1))
}

export function formatOazoFee(oazoFee: BigNumber): string {
  return `${formatAmount(oazoFee, 'USD')} DAI`
}
