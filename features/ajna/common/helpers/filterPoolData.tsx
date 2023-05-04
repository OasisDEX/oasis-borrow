import { AssetsTableDataCellInactive } from 'components/assetsTable/cellComponents/AssetsTableDataCellInactive'
import { AjnaPoolData, AjnaProduct } from 'features/ajna/common/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatFiatBalance,
} from 'helpers/formatters/format'
import React from 'react'

interface FilterPoolDataParams {
  data: AjnaPoolData
  pair: string
  product: AjnaProduct
}

export function filterPoolData({ data, pair, product }: FilterPoolDataParams) {
  switch (product) {
    case 'borrow':
      if (Object.keys(data).includes(pair)) {
        const payload = data[pair as keyof typeof data]

        return {
          minPositionSize: `$${formatFiatBalance(payload.minPositionSize)}`,
          maxLtv: formatDecimalAsPercent(payload.maxLtv),
          liquidityAvaliable: `$${formatFiatBalance(payload.liquidityAvaliable)}`,
          annualFee: formatDecimalAsPercent(payload.annualFee),
        }
      } else
        return {
          minPositionSize: <AssetsTableDataCellInactive />,
          maxLtv: <AssetsTableDataCellInactive />,
          liquidityAvaliable: <AssetsTableDataCellInactive />,
          annualFee: <AssetsTableDataCellInactive />,
        }
    case 'earn': {
      if (Object.keys(data).includes(pair)) {
        const payload = data[pair as keyof typeof data]

        return {
          '90DayNetApy': formatDecimalAsPercent(payload['90DayNetApy']),
          '7DayNetApy': formatDecimalAsPercent(payload['7DayNetApy']),
          tvl: `$${formatFiatBalance(payload.tvl)}`,
          minLtv: formatDecimalAsPercent(payload.minLtv),
        }
      } else
        return {
          '90DayNetApy': <AssetsTableDataCellInactive />,
          '7DayNetApy': <AssetsTableDataCellInactive />,
          tvl: <AssetsTableDataCellInactive />,
          minLtv: <AssetsTableDataCellInactive />,
        }
    }
    case 'multiply': {
      if (Object.keys(data).includes(pair)) {
        const payload = data[pair as keyof typeof data]

        return {
          with50Tokens: `${formatCryptoBalance(payload.with50Tokens)} ${pair.split('-')[0]}`,
          maxMultiple: `${payload.maxMultiply.toFixed(2)}`,
          liquidityAvaliable: `$${formatFiatBalance(payload.liquidityAvaliable)}`,
          annualFee: formatDecimalAsPercent(payload.annualFee),
        }
      } else
        return {
          with50Tokens: <AssetsTableDataCellInactive />,
          maxMultiple: <AssetsTableDataCellInactive />,
          liquidityAvaliable: <AssetsTableDataCellInactive />,
          annualFee: <AssetsTableDataCellInactive />,
        }
    }
  }
}
