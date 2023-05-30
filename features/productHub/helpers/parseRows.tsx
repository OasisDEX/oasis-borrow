import BigNumber from 'bignumber.js'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableDataCellInactive } from 'components/assetsTable/cellComponents/AssetsTableDataCellInactive'
import { AssetsTableTooltip } from 'components/assetsTable/cellComponents/AssetsTableTooltip'
import { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { ProductHubItem, ProductType } from 'features/productHub/types'
import { formatDecimalAsPercent, formatFiatBalance } from 'helpers/formatters/format'
import { upperFirst } from 'lodash'
import React from 'react'
import { Trans } from 'react-i18next'

function parseProductNumbers(stringNumbers: (string | undefined)[]): (BigNumber | undefined)[] {
  return stringNumbers.map((number) => (number ? new BigNumber(number) : undefined))
}

function parseProduct(
  {
    weeklyNetApy: weeklyNetApyString,
    earnStrategy,
    fee: feeString,
    liquidity: liquidityString,
    managementType,
    maxLtv: maxLtvString,
    maxMultiply: maxMultiplyString,
    multiplyStrategy,
    tooltips,
    with50Tokens,
  }: ProductHubItem,
  product: ProductType,
): AssetsTableRowData {
  const [weeklyNetApy, fee, liquidity, maxLtv, maxMultiply] = parseProductNumbers([
    weeklyNetApyString,
    feeString,
    liquidityString,
    maxLtvString,
    maxMultiplyString,
  ])
  switch (product) {
    case ProductType.Borrow:
      return {
        with50Tokens: {
          sortable: with50Tokens ? parseInt(with50Tokens, 10) : 0,
          value: with50Tokens ? (
            <>
              {with50Tokens}
              {tooltips?.with50Tokens && <AssetsTableTooltip {...tooltips.with50Tokens} />}
            </>
          ) : (
            <AssetsTableDataCellInactive />
          ),
        },
        maxLtv: {
          sortable: maxLtv ? maxLtv.toNumber() : 0,
          value: maxLtv ? (
            <>
              {formatDecimalAsPercent(maxLtv)}
              {tooltips?.maxLtv && <AssetsTableTooltip {...tooltips.maxLtv} />}
            </>
          ) : (
            <AssetsTableDataCellInactive />
          ),
        },
        liquidityAvaliable: {
          sortable: liquidity ? liquidity.toNumber() : 0,
          value: liquidity ? (
            <>
              ${formatFiatBalance(liquidity)}
              {tooltips?.liquidity && <AssetsTableTooltip {...tooltips.liquidity} />}
            </>
          ) : (
            <AssetsTableDataCellInactive />
          ),
        },
        borrowRate: {
          sortable: fee ? fee.toNumber() : 0,
          value: fee ? (
            <>
              {formatDecimalAsPercent(fee)}
              {tooltips?.fee && <AssetsTableTooltip {...tooltips.fee} />}
            </>
          ) : (
            <AssetsTableDataCellInactive />
          ),
        },
      }
    case ProductType.Multiply:
      return {
        strategy: multiplyStrategy ? (
          <>
            {multiplyStrategy}
            {tooltips?.multiplyStrategy && <AssetsTableTooltip {...tooltips.multiplyStrategy} />}
          </>
        ) : (
          <AssetsTableDataCellInactive />
        ),
        maxMultiple: {
          sortable: maxMultiply ? maxMultiply.toNumber() : 0,
          value: maxMultiply ? (
            <>
              {maxMultiply.toFixed(2)}x
              {tooltips?.maxMultiply && <AssetsTableTooltip {...tooltips.maxMultiply} />}
            </>
          ) : (
            <AssetsTableDataCellInactive />
          ),
        },
        liquidityAvaliable: {
          sortable: liquidity ? liquidity.toNumber() : 0,
          value: liquidity ? (
            <>
              ${formatFiatBalance(liquidity)}
              {tooltips?.liquidity && <AssetsTableTooltip {...tooltips.liquidity} />}
            </>
          ) : (
            <AssetsTableDataCellInactive />
          ),
        },
        variableFeeYr: {
          sortable: fee ? fee.toNumber() : 0,
          value: fee ? (
            <>
              {formatDecimalAsPercent(fee)}
              {tooltips?.fee && <AssetsTableTooltip {...tooltips.fee} />}
            </>
          ) : (
            <AssetsTableDataCellInactive />
          ),
        },
      }
    case ProductType.Earn:
      return {
        strategy: earnStrategy ? (
          <>
            {earnStrategy}
            {tooltips?.earnStrategy && <AssetsTableTooltip {...tooltips.earnStrategy} />}
          </>
        ) : (
          <AssetsTableDataCellInactive />
        ),
        management: managementType ? (
          <>
            <Trans i18nKey={`product-hub.table.${managementType}`} />
            {tooltips?.managementType && <AssetsTableTooltip {...tooltips.managementType} />}
          </>
        ) : (
          <AssetsTableDataCellInactive />
        ),
        '7DayNetApy': {
          sortable: weeklyNetApy ? weeklyNetApy.toNumber() : 0,
          value: weeklyNetApy ? (
            <>
              {formatDecimalAsPercent(weeklyNetApy)}
              {tooltips?.['7DayNetApy'] && <AssetsTableTooltip {...tooltips['7DayNetApy']} />}
            </>
          ) : (
            <AssetsTableDataCellInactive />
          ),
        },
        liquidityAvaliable: {
          sortable: liquidity ? liquidity.toNumber() : 0,
          value: liquidity ? (
            <>
              ${formatFiatBalance(liquidity)}
              {tooltips?.liquidity && <AssetsTableTooltip {...tooltips.liquidity} />}
            </>
          ) : (
            <AssetsTableDataCellInactive />
          ),
        },
      }
  }
}

export function parseRows(rows: ProductHubItem[], product: ProductType): AssetsTableRowData[] {
  return rows.map((row) => {
    const { depositToken, label, network, primaryToken, protocol, reverseTokens, secondaryToken } =
      row
    const icons = primaryToken === secondaryToken ? [primaryToken] : [primaryToken, secondaryToken]
    const asset = product === ProductType.Earn ? depositToken || primaryToken : label

    if (reverseTokens) icons.reverse()

    return {
      [product === ProductType.Earn ? 'depositToken' : 'collateralDebt']: (
        <AssetsTableDataCellAsset asset={asset} icons={icons} />
      ),
      ...parseProduct(row, product),
      protocolNetwork: (
        <ProtocolLabel
          network={Array.isArray(network) ? network[0] : network}
          protocol={protocol}
        />
      ),
      action: <AssetsTableDataCellAction cta={upperFirst(product)} link="/" />,
    }
  })
}
