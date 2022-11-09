import { formatBigNumber } from '../../../helpers/formatters/format'
import {
  AdjustRiskViewConfig,
  richFormattedBoundary,
} from '../../aave/common/components/SidebarAdjustRiskView'

export const adjustRiskSliderConfig: AdjustRiskViewConfig = {
  liquidationPriceFormatter: (qty) => {
    return richFormattedBoundary({ value: formatBigNumber(qty, 2), unit: 'STETH/ETH' })
  },
  rightBoundaryConfig: {
    valueExtractor: (data) => data?.oracleAssetPrice,
    formatter: (qty) => {
      return richFormattedBoundary({ value: formatBigNumber(qty, 2), unit: 'STETH/ETH' })
    },
    translationKey: 'open-earn.aave.vault-form.configure-multiple.current-price',
  },
}
