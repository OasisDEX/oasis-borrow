import type { OmniNetValuePnlData, OmniNetValuePnlDataReturnType } from 'features/omni-kit/helpers'
import { getOmniNetValue } from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'

export const getOmniNetValuePnlData = ({
  cumulatives,
  productType,
  collateralTokenPrice,
  debtTokenPrice,
  netValueInCollateralToken,
  netValueInDebtToken,
  collateralToken,
  debtToken,
  useDebtTokenAsPnL = false,
}: OmniNetValuePnlData) => {
  const netValue = getOmniNetValue({
    productType,
    collateralTokenPrice,
    debtTokenPrice,
    netValueInCollateralToken,
    netValueInDebtToken,
    collateralToken,
    debtToken,
    useDebtTokenAsPnL,
  })
  switch (productType) {
    case OmniProductType.Borrow: {
      return {
        netValue,
      } as OmniNetValuePnlDataReturnType
    }
    case OmniProductType.Multiply: {
      const pnlPercentage = cumulatives?.cumulativeWithdrawInCollateralToken
        .plus(netValueInCollateralToken)
        .minus(cumulatives.cumulativeDepositInCollateralToken)
        .div(cumulatives.cumulativeDepositInCollateralToken)

      const pnlPercentageDebt = cumulatives?.cumulativeWithdrawInQuoteToken
        .plus(netValueInDebtToken)
        .minus(cumulatives.cumulativeDepositInQuoteToken)
        .div(cumulatives.cumulativeDepositInQuoteToken)

      const pnlPercentageUsd = cumulatives?.cumulativeWithdrawUSD
        .plus(netValueInDebtToken)
        .minus(cumulatives.cumulativeDepositUSD)
        .div(cumulatives.cumulativeDepositUSD)

      if (useDebtTokenAsPnL) {
        return {
          pnl: {
            pnlToken: debtToken,
            percentage: pnlPercentageDebt,
            percentageUsd: pnlPercentageUsd,
            inToken: cumulatives?.cumulativeDepositInQuoteToken.times(pnlPercentageDebt ?? zero),
            inUsd: cumulatives?.cumulativeDepositInQuoteToken
              .times(pnlPercentageDebt ?? zero)
              .times(debtTokenPrice),
          },
          netValue,
          pnlCumulatives: {
            deposit: {
              inUsd: cumulatives?.cumulativeDepositUSD,
              inToken: cumulatives?.cumulativeDepositInQuoteToken,
            },
            withdraw: {
              inUsd: cumulatives?.cumulativeWithdrawUSD,
              inToken: cumulatives?.cumulativeWithdrawInQuoteToken,
            },
            fees: {
              inUsd: cumulatives?.cumulativeFeesUSD,
              inToken: cumulatives?.cumulativeFeesInQuoteToken,
            },
          },
        } as OmniNetValuePnlDataReturnType
      }

      return {
        pnl: {
          pnlToken: collateralToken,
          percentage: pnlPercentage,
          percentageUsd: pnlPercentageUsd,
          inToken: cumulatives?.cumulativeDepositInCollateralToken.times(pnlPercentage ?? zero),
          inUsd: cumulatives?.cumulativeDepositInCollateralToken
            .times(pnlPercentage ?? zero)
            .times(collateralTokenPrice),
        },
        netValue,
        pnlCumulatives: {
          deposit: {
            inUsd: cumulatives?.cumulativeDepositUSD,
            inToken: cumulatives?.cumulativeDepositInCollateralToken,
          },
          withdraw: {
            inUsd: cumulatives?.cumulativeWithdrawUSD,
            inToken: cumulatives?.cumulativeWithdrawInCollateralToken,
          },
          fees: {
            inUsd: cumulatives?.cumulativeFeesUSD,
            inToken: cumulatives?.cumulativeFeesInCollateralToken,
          },
        },
      } as OmniNetValuePnlDataReturnType
    }
    case OmniProductType.Earn: {
      const pnlPercentage = cumulatives?.cumulativeWithdrawInQuoteToken
        .plus(netValueInDebtToken)
        .minus(cumulatives.cumulativeDepositInQuoteToken)
        .div(cumulatives.cumulativeDepositInQuoteToken)

      const pnlPercentageUsd = cumulatives?.cumulativeWithdrawUSD
        .plus(netValueInDebtToken)
        .minus(cumulatives.cumulativeDepositUSD)
        .div(cumulatives.cumulativeDepositUSD)
      return {
        pnl: {
          pnlToken: debtToken,
          percentage: pnlPercentage,
          percentageUsd: pnlPercentageUsd,
          inToken: cumulatives?.cumulativeDepositInQuoteToken.times(pnlPercentage ?? zero),
          inUsd: cumulatives?.cumulativeDepositInQuoteToken
            .times(pnlPercentage ?? zero)
            .times(debtTokenPrice),
        },
        netValue,
        pnlCumulatives: {
          deposit: {
            inUsd: cumulatives?.cumulativeDepositUSD,
            inToken: cumulatives?.cumulativeDepositInQuoteToken,
          },
          withdraw: {
            inUsd: cumulatives?.cumulativeWithdrawUSD,
            inToken: cumulatives?.cumulativeWithdrawInQuoteToken,
          },
          fees: {
            inUsd: cumulatives?.cumulativeFeesUSD,
            inToken: cumulatives?.cumulativeFeesInQuoteToken,
          },
        },
      } as OmniNetValuePnlDataReturnType
    }
  }
}
