import type BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { getAddConstantMultipleHistoryEventIndex } from 'features/vaultHistory/getAddConstantMultipleHistoryEventIndex'
import type { VaultEvent } from 'features/vaultHistory/vaultHistoryEvents.types'
import { zero } from 'helpers/zero'

function getCumulativeDepositUSD(total: BigNumber, event: VaultEvent) {
  switch (event.kind) {
    case 'DEPOSIT':
    case 'DEPOSIT-GENERATE':
      if (event.reclaim) {
        return total
      }

      return total.plus(event.collateralAmount.times(event.oraclePrice))
    case 'PAYBACK':
    case 'WITHDRAW-PAYBACK':
      return total.plus(event.daiAmount.abs())
    case 'OPEN_MULTIPLY_VAULT':
    case 'INCREASE_MULTIPLE':
      return total.plus(event.depositCollateral.times(event.marketPrice)).plus(event.depositDai)
    case 'OPEN_MULTIPLY_GUNI_VAULT':
      return total.plus(event.depositDai)
    case 'MOVE_DEST':
      return total.plus(event.collateralAmount.times(event.oraclePrice))
    case 'MOVE_SRC':
      return total.plus(event.daiAmount.abs())
    default:
      return total
  }
}

function getCumulativeWithdrawnUSD(total: BigNumber, event: VaultEvent) {
  switch (event.kind) {
    case 'WITHDRAW':
    case 'WITHDRAW-PAYBACK':
      return total.plus(event.collateralAmount.abs().times(event.oraclePrice))
    case 'GENERATE':
    case 'DEPOSIT-GENERATE':
      return total.plus(event.daiAmount)
    case 'DECREASE_MULTIPLE':
      return total
        .plus(event.withdrawnCollateral.abs().times(event.marketPrice))
        .plus(event.withdrawnDai.abs())
    case 'CLOSE_VAULT_TO_COLLATERAL':
      return total.plus(event.exitCollateral.times(event.marketPrice)).plus(event.exitDai)
    case 'CLOSE_VAULT_TO_DAI':
    case 'CLOSE_GUNI_VAULT_TO_DAI':
      return total.plus(event.exitDai)
    case 'MOVE_SRC':
      return total.plus(event.collateralAmount.times(event.oraclePrice))
    case 'MOVE_DEST':
      return total.plus(event.daiAmount.abs())
    default:
      return total
  }
}

export function getCumulativeFeesUSD(
  total: BigNumber,
  event: VaultEvent,
  currentIndex: number,
  events: VaultEvent[],
) {
  switch (event.kind) {
    case 'OPEN_MULTIPLY_VAULT':
    case 'OPEN_MULTIPLY_GUNI_VAULT':
    case 'DECREASE_MULTIPLE':
    case 'INCREASE_MULTIPLE':
    case 'CLOSE_VAULT_TO_COLLATERAL':
    case 'CLOSE_VAULT_TO_DAI':
    case 'CLOSE_GUNI_VAULT_TO_DAI':
    case 'DEPOSIT':
    case 'GENERATE':
    case 'DEPOSIT-GENERATE':
    case 'WITHDRAW':
    case 'PAYBACK':
    case 'WITHDRAW-PAYBACK':
    case 'basic-buy':
    case 'basic-sell':
    case 'stop-loss':
      const potentialEventWithSameHash = events[currentIndex - 1]

      if (!potentialEventWithSameHash || event.hash !== potentialEventWithSameHash?.hash) {
        return total.plus(amountFromWei(event.gasFee || zero, 'ETH').times(event.ethPrice || zero))
      }

      return total
    default:
      return total
  }
}

export function getCumulativeOasisFeeUSD(total: BigNumber, event: VaultEvent) {
  switch (event.kind) {
    case 'OPEN_MULTIPLY_VAULT':
    case 'OPEN_MULTIPLY_GUNI_VAULT':
    case 'DECREASE_MULTIPLE':
    case 'INCREASE_MULTIPLE':
    case 'CLOSE_VAULT_TO_COLLATERAL':
    case 'CLOSE_VAULT_TO_DAI':
    case 'CLOSE_GUNI_VAULT_TO_DAI':
      return total.plus(event.oazoFee)
    default:
      return total
  }
}

function getCumulativeConstantMultipleFeeUSD(
  total: BigNumber,
  event: VaultEvent,
  currentIndex: number,
  events: VaultEvent[],
) {
  switch (event.kind) {
    case 'INCREASE_MULTIPLE':
    case 'DECREASE_MULTIPLE':
      const potentialExecuteEvent = events[currentIndex + 1]

      if (
        'eventType' in potentialExecuteEvent &&
        potentialExecuteEvent.eventType === 'executed' &&
        event.hash === potentialExecuteEvent.hash
      ) {
        return total
          .plus(amountFromWei(event.gasFee || zero, 'ETH').times(event.ethPrice))
          .plus(event.oazoFee)
      }
      return total
    case 'basic-buy':
    case 'basic-sell':
      const potentialEventWithSameHash = events[currentIndex - 1]

      if (!potentialEventWithSameHash || event.hash !== potentialEventWithSameHash?.hash) {
        return total.plus(amountFromWei(event.gasFee || zero, 'ETH').times(event.ethPrice || zero))
      }

      return total
    default:
      return total
  }
}

export function calculatePNL(events: VaultEvent[], currentNetValueUSD: BigNumber) {
  const cumulativeDepositUSD = events.reduce(getCumulativeDepositUSD, zero)
  const cumulativeWithdrawnUSD = events.reduce(getCumulativeWithdrawnUSD, zero)
  const cumulativeFeesUSD = events.reduce(getCumulativeFeesUSD, zero)

  if (cumulativeDepositUSD.isZero()) {
    return zero
  }

  return cumulativeWithdrawnUSD
    .plus(currentNetValueUSD)
    .minus(cumulativeFeesUSD)
    .minus(cumulativeDepositUSD)
    .div(cumulativeDepositUSD)
}

export function calculateGrossEarnings(events: VaultEvent[], currentNetValueUSD: BigNumber) {
  const cumulativeDepositUSD = events.reduce(getCumulativeDepositUSD, zero)
  const cumulativeWithdrawnUSD = events.reduce(getCumulativeWithdrawnUSD, zero)
  const oasisFee = events.reduce(getCumulativeOasisFeeUSD, zero)

  const earnings = currentNetValueUSD
    .minus(cumulativeDepositUSD)
    .plus(cumulativeWithdrawnUSD)
    .plus(oasisFee)

  return earnings.gte(zero) ? earnings : zero
}

export function calculateNetEarnings(events: VaultEvent[], currentNetValueUSD: BigNumber) {
  const cumulativeDepositUSD = events.reduce(getCumulativeDepositUSD, zero)
  const cumulativeWithdrawnUSD = events.reduce(getCumulativeWithdrawnUSD, zero)
  const cumulativeFeesUSD = events.reduce(getCumulativeFeesUSD, zero)

  return currentNetValueUSD
    .minus(cumulativeDepositUSD)
    .plus(cumulativeWithdrawnUSD)
    .minus(cumulativeFeesUSD)
}

export function calculatePNLFromAddConstantMultipleEvent(
  events: VaultEvent[],
  currentNetValueUSD: BigNumber,
) {
  const addConstantMultipleIndex = getAddConstantMultipleHistoryEventIndex(events)
  const totalPnL = calculatePNL(events, currentNetValueUSD)
  const eventsTillConstantMultiple = events.slice(addConstantMultipleIndex)
  const PnLTillConstantMultiple = calculatePNL(eventsTillConstantMultiple, currentNetValueUSD)

  return totalPnL.minus(PnLTillConstantMultiple)
}

export function calculateTotalCostOfConstantMultiple(events: VaultEvent[]) {
  const addConstantMultipleIndex = getAddConstantMultipleHistoryEventIndex(events)
  const eventsSinceConstantMultiple = events.slice(0, addConstantMultipleIndex)

  return eventsSinceConstantMultiple.reduce(getCumulativeConstantMultipleFeeUSD, zero)
}
