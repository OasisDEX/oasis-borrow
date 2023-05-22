import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableDataCellInactive } from 'components/assetsTable/cellComponents/AssetsTableDataCellInactive'
import { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { OasisCreateItem, ProductType } from 'features/oasisCreate/types'
import { formatDecimalAsPercent, formatFiatBalance } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import React from 'react'
import { Trans } from 'react-i18next'

function parseProduct(
  {
    '7DayNetApy': weeklyNetApy,
    '90DayNetApy': quarterlyNetApy,
    fee,
    strategy,
    liquidity,
    managementType,
    maxLtv,
    maxMultiply,
  }: OasisCreateItem,
  product: ProductType,
): AssetsTableRowData {
  switch (product) {
    case ProductType.Borrow:
      return {
        with50Tokens: {
          sortable: 0,
          value: <AssetsTableDataCellInactive />,
        },
        maxLtv: {
          sortable: maxLtv ? maxLtv.toNumber() : 0,
          value: maxLtv ? formatDecimalAsPercent(maxLtv) : <AssetsTableDataCellInactive />,
        },
        liquidityAvaliable: {
          sortable: liquidity ? liquidity.toNumber() : 0,
          value: liquidity ? `$${formatFiatBalance(liquidity)}` : <AssetsTableDataCellInactive />,
        },
        borrowRate: {
          sortable: fee ? fee.toNumber() : 0,
          value: fee ? formatDecimalAsPercent(fee) : <AssetsTableDataCellInactive />,
        },
      }
    case ProductType.Earn:
      return {
        management: managementType ? (
          <Trans i18nKey={`oasis-create.table.${managementType}`} />
        ) : (
          <AssetsTableDataCellInactive />
        ),
        '90DayNetApy': {
          sortable: quarterlyNetApy ? quarterlyNetApy.toNumber() : 0,
          value: quarterlyNetApy ? (
            formatDecimalAsPercent(quarterlyNetApy)
          ) : (
            <AssetsTableDataCellInactive />
          ),
        },
        '7DayNetApy': {
          sortable: weeklyNetApy ? weeklyNetApy.toNumber() : 0,
          value: weeklyNetApy ? (
            formatDecimalAsPercent(weeklyNetApy)
          ) : (
            <AssetsTableDataCellInactive />
          ),
        },
        liquidityAvaliable: {
          sortable: liquidity ? liquidity.toNumber() : 0,
          value: liquidity ? `$${formatFiatBalance(liquidity)}` : <AssetsTableDataCellInactive />,
        },
      }
    case ProductType.Multiply:
      return {
        longShort: strategy ? (
          <Trans
            i18nKey={`oasis-create.table.${
              Array.isArray(strategy)
                ? strategy.sort((a, b) => (a > b ? -1 : 1)).join('-')
                : strategy
            }`}
          />
        ) : (
          <AssetsTableDataCellInactive />
        ),
        maxMultiple: {
          sortable: maxMultiply ? maxMultiply.toNumber() : 0,
          value: maxMultiply ? `${maxMultiply}x` : <AssetsTableDataCellInactive />,
        },
        liquidityAvaliable: {
          sortable: liquidity ? liquidity.toNumber() : 0,
          value: liquidity ? `$${formatFiatBalance(liquidity)}` : <AssetsTableDataCellInactive />,
        },
        variableFeeYr: {
          sortable: fee ? fee.toNumber() : 0,
          value: fee ? formatDecimalAsPercent(fee) : <AssetsTableDataCellInactive />,
        },
      }
  }
}

export function parseRows(rows: OasisCreateItem[], product: ProductType): AssetsTableRowData[] {
  return rows.map((row) => {
    const { label, network, primaryToken, protocol, secondaryToken, url } = row
    const assets = primaryToken === secondaryToken ? [primaryToken] : [primaryToken, secondaryToken]

    if (product === 'earn' && protocol === LendingProtocol.Ajna) assets.reverse()

    return {
      collateralDebt: <AssetsTableDataCellAsset asset={label} icons={assets} />,
      ...parseProduct(row, product),
      protocolNetwork: (
        <ProtocolLabel
          network={Array.isArray(network) ? network[0] : network}
          protocol={protocol}
        />
      ),
      action: <AssetsTableDataCellAction cta={upperFirst(product)} link={url} />,
    }
  })
}
