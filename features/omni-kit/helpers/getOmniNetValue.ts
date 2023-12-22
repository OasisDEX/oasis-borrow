import { ProductType } from 'features/aave/types'
import type {
  OmniNetValuePnlData,
  OmniNetValuePnlDataReturnType,
} from 'features/omni-kit/helpers/getOmniNetValuePnlData.types'

export const getOmniNetValue = ({
  productType,
  collateralTokenPrice,
  debtTokenPrice,
  netValueInCollateralToken,
  netValueInDebtToken,
  collateralToken,
  debtToken,
}: OmniNetValuePnlData) => {
  switch (productType) {
    case ProductType.Multiply:
    case ProductType.Borrow: {
      return {
        netValueToken: collateralToken,
        netValueTokenPrice: collateralTokenPrice,
        inToken: netValueInCollateralToken,
        inUsd: netValueInCollateralToken.times(collateralTokenPrice),
      } as OmniNetValuePnlDataReturnType['netValue']
    }
    case ProductType.Earn: {
      return {
        netValueToken: debtToken,
        netValueTokenPrice: debtTokenPrice,
        inToken: netValueInDebtToken,
        inUsd: netValueInDebtToken.times(debtTokenPrice),
      } as OmniNetValuePnlDataReturnType['netValue']
    }
  }
}
