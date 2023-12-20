import { ProductType } from 'features/aave/types'
import type {
  OmniNetValuePnlData,
  OmniNetValuePnlDataReturnType,
} from 'features/omni-kit/helpers/getOmniNetValuePnlData.types'
import { getOmniUnderlyingToken } from 'features/omni-kit/helpers/getOmniUnderlyingToken'
import { one, zero } from 'helpers/zero'

export const getOmniNetValuePnlData = ({
  cumulatives,
  productType,
  collateralTokenPrice,
  netValueInCollateralToken,
  collateralToken,
  oraclePriceForCollateralDebtExchangeRate,
}: OmniNetValuePnlData) => {
  switch (productType) {
    case ProductType.Borrow: {
      // borrow just needs proper net value
      // no pnl + no modal
      return {
        netValue: {
          netValueToken: collateralToken,
          netValueTokenPrice: collateralTokenPrice,
          inToken: netValueInCollateralToken,
          inUsd: netValueInCollateralToken.times(collateralTokenPrice),
        },
      } as OmniNetValuePnlDataReturnType
    }
    case ProductType.Multiply: {
      // multiply: net value in collateral + subline in USD
      // pnl modal: pnl in collateral + in USD
      const pnlPercentage = cumulatives?.cumulativeWithdrawInCollateralToken
        .plus(netValueInCollateralToken)
        .minus(cumulatives.cumulativeDepositInCollateralToken)
        .div(cumulatives.cumulativeDepositInCollateralToken)
      return {
        pnl: {
          pnlToken: collateralToken,
          percentage: pnlPercentage,
          inToken: netValueInCollateralToken.times(pnlPercentage || zero),
        },
        netValue: {
          netValueToken: collateralToken,
          netValueTokenPrice: collateralTokenPrice,
          inToken: netValueInCollateralToken,
          inUsd: netValueInCollateralToken.times(collateralTokenPrice),
        },
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
    case ProductType.Earn: {
      // earn: net value in UNDERLYING collateral/quote (remember to pass quotetoken  as collateral here) + subline in USD
      // netValueInCollateralToken should be in underlying collateral token
      // same goes for pnl modal - all underlying collateral + in USD
      const underlyingCollateralToken = getOmniUnderlyingToken(collateralToken)
      const underlyingTokenOraclePrice = oraclePriceForCollateralDebtExchangeRate || one
      const pnlPercentage = cumulatives?.cumulativeWithdrawInCollateralToken
        .plus(netValueInCollateralToken.div(underlyingTokenOraclePrice))
        .minus(cumulatives.cumulativeDepositInCollateralToken)
        .div(cumulatives.cumulativeDepositInCollateralToken)
      const netValueInUnderlyingCollateralToken = netValueInCollateralToken.div(
        underlyingTokenOraclePrice,
      )
      return {
        pnl: {
          pnlToken: underlyingCollateralToken,
          percentage: pnlPercentage,
          inToken: netValueInUnderlyingCollateralToken.times(pnlPercentage || zero),
        },
        netValue: {
          netValueToken: underlyingCollateralToken,
          netValueTokenPrice: collateralTokenPrice,
          inToken: netValueInUnderlyingCollateralToken,
          inUsd: netValueInUnderlyingCollateralToken.times(collateralTokenPrice),
        },
        pnlCumulatives: {
          deposit: {
            inUsd: cumulatives?.cumulativeDepositUSD,
            inToken: cumulatives?.cumulativeDepositInCollateralToken.div(
              underlyingTokenOraclePrice,
            ),
          },
          withdraw: {
            inUsd: cumulatives?.cumulativeWithdrawUSD,
            inToken: cumulatives?.cumulativeWithdrawInCollateralToken.div(
              underlyingTokenOraclePrice,
            ),
          },
          fees: {
            inUsd: cumulatives?.cumulativeFeesUSD,
            inToken: cumulatives?.cumulativeFeesInCollateralToken.div(underlyingTokenOraclePrice),
          },
        },
      } as OmniNetValuePnlDataReturnType
    }
  }
}
