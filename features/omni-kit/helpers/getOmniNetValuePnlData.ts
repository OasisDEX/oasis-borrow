import { ProductType } from 'features/aave/types'
import { getOmniNetValue } from 'features/omni-kit/helpers/getOmniNetValue'
import type {
  OmniNetValuePnlData,
  OmniNetValuePnlDataReturnType,
} from 'features/omni-kit/helpers/getOmniNetValuePnlData.types'
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
}: OmniNetValuePnlData) => {
  const netValue = getOmniNetValue({
    productType,
    collateralTokenPrice,
    debtTokenPrice,
    netValueInCollateralToken,
    netValueInDebtToken,
    collateralToken,
    debtToken,
  })
  switch (productType) {
    case ProductType.Borrow: {
      return {
        netValue,
      } as OmniNetValuePnlDataReturnType
    }
    case ProductType.Multiply: {
      const pnlPercentage = cumulatives?.cumulativeWithdrawInCollateralToken
        .plus(netValueInCollateralToken)
        .minus(cumulatives.cumulativeDepositInCollateralToken)
        .div(cumulatives.cumulativeDepositInCollateralToken)
      return {
        pnl: {
          pnlToken: collateralToken,
          percentage: pnlPercentage,
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
    case ProductType.Earn: {
      const pnlPercentage = cumulatives?.cumulativeWithdrawInQuoteToken
        .plus(netValueInDebtToken)
        .minus(cumulatives.cumulativeDepositInQuoteToken)
        .div(cumulatives.cumulativeDepositInQuoteToken)
      return {
        pnl: {
          pnlToken: debtToken,
          percentage: pnlPercentage,
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
