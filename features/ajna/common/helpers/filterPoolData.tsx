import { AjnaPoolData, AjnaProduct } from 'features/ajna/common/types'
import { DiscoverTableDataCellInactive } from 'features/discover/common/DiscoverTableDataCellContent'
import { formatFiatBalance, formatPercent } from 'helpers/formatters/format'
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
          maxLtv: formatPercent(payload.maxLtv, { precision: 2 }),
          liquidityAvaliable: `$${formatFiatBalance(payload.liquidityAvaliable)}`,
          annualFee: formatPercent(payload.annualFee, { precision: 2 }),
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
          '90DayNetApy': formatPercent(payload['90DayNetApy'], { precision: 2 }),
          '7DayNetApy': formatPercent(payload['7DayNetApy'], { precision: 2 }),
          tvl: `$${formatFiatBalance(payload.tvl)}`,
          minLtv: formatPercent(payload.minLtv, { precision: 2 }),
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
