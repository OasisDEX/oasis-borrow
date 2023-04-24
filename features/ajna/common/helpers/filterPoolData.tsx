import { AjnaPoolData, AjnaProduct } from 'features/ajna/common/types'
import { DiscoverTableDataCellInactive } from 'features/discover/common/DiscoverTableDataCellComponents'
import { formatDecimalAsPercent, formatFiatBalance } from 'helpers/formatters/format'
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
          minPositionSize: <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
          maxLtv: <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
          liquidityAvaliable: <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
          annualFee: <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
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
          '90DayNetApy': <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
          '7DayNetApy': <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
          tvl: <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
          minLtv: <DiscoverTableDataCellInactive>n/a</DiscoverTableDataCellInactive>,
        }
    }
    case 'multiply': {
      return {}
    }
  }
}
