import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { VaultEvent } from 'features/vaultHistory/vaultHistoryEvents'
import { zero } from 'helpers/zero'

export const OAZO_FEE = new BigNumber(0.002)
export const OAZO_LOWER_FEE = new BigNumber(0.0004)
export const LOAN_FEE = new BigNumber(0.0)
export const SLIPPAGE = new BigNumber(0.005)
export const GUNI_MAX_SLIPPAGE = new BigNumber(0.001)
export const GUNI_SLIPPAGE = new BigNumber(0)

function getCumulativeDepositUSD(total: BigNumber, event: VaultEvent) {
  switch (event.kind) {
    case 'DEPOSIT':
    case 'DEPOSIT-GENERATE':
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
    default:
      return total
  }
}

function getCumulativeLossesUSD(total: BigNumber, event: VaultEvent) {
  switch (event.kind) {
    case 'AUCTION_STARTED':
    case 'AUCTION_STARTED_V2':
      return event.oraclePrice
        ? total.plus(event.collateralAmount.abs().times(event.oraclePrice))
        : total
    default:
      return total
  }
}

export function getCumulativeFeesUSD(total: BigNumber, event: VaultEvent) {
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
      return total.plus(amountFromWei(event.gasFee || zero, 'ETH').times(event.ethPrice))
    default:
      return total
  }
}

export function calculatePNL(events: VaultEvent[], currentNetValueUSD: BigNumber) {
  const cumulativeDepositUSD = events.reduce(getCumulativeDepositUSD, zero)
  const cumulativeWithdrawnUSD = events.reduce(getCumulativeWithdrawnUSD, zero)
  const cumulativeFeesUSD = events.reduce(getCumulativeFeesUSD, zero)
  const cumulativeLossesUSD = events.reduce(getCumulativeLossesUSD, zero)

  if (cumulativeDepositUSD.isZero()) {
    return zero
  }

  return cumulativeWithdrawnUSD
    .plus(currentNetValueUSD)
    .minus(cumulativeFeesUSD)
    .minus(cumulativeLossesUSD)
    .minus(cumulativeDepositUSD)
    .div(cumulativeDepositUSD)
}
