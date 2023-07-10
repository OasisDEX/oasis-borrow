import { negativeToZero } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableDataCellInactive } from 'components/assetsTable/cellComponents/AssetsTableDataCellInactive'
import { AssetsTableTooltip } from 'components/assetsTable/cellComponents/AssetsTableTooltip'
import { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { getActionUrl } from 'features/productHub/helpers'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { formatDecimalAsPercent, formatFiatBalance } from 'helpers/formatters/format'
import { upperFirst } from 'lodash'
import React from 'react'
import { Trans } from 'react-i18next'

function parseProductNumbers(stringNumbers: (string | undefined)[]): (BigNumber | undefined)[] {
  return stringNumbers.map((number) => (number ? negativeToZero(new BigNumber(number)) : undefined))
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
  }: ProductHubItem,
  product: ProductHubProductType,
): AssetsTableRowData {
  const [weeklyNetApy, fee, liquidity, maxLtv, maxMultiply] = parseProductNumbers([
    weeklyNetApyString,
    feeString,
    liquidityString,
    maxLtvString,
    maxMultiplyString,
  ])
  switch (product) {
    case ProductHubProductType.Borrow:
      return {
        maxLtv: {
          sortable: maxLtv?.toNumber() || 0,
          value: (
            <>
              {maxLtv ? formatDecimalAsPercent(maxLtv) : <AssetsTableDataCellInactive />}
              {tooltips?.maxLtv && <AssetsTableTooltip {...tooltips.maxLtv} />}
            </>
          ),
        },
        liquidityAvailable: {
          sortable: liquidity?.toNumber() || 0,
          value: (
            <>
              {liquidity ? `$${formatFiatBalance(liquidity)}` : <AssetsTableDataCellInactive />}
              {tooltips?.liquidity && <AssetsTableTooltip {...tooltips.liquidity} />}
            </>
          ),
        },
        borrowRate: {
          sortable: fee?.toNumber() || 0,
          value: (
            <>
              {fee ? formatDecimalAsPercent(fee) : <AssetsTableDataCellInactive />}
              {tooltips?.fee && <AssetsTableTooltip {...tooltips.fee} />}
            </>
          ),
        },
      }
    case ProductHubProductType.Multiply:
      return {
        strategy: (
          <>
            {multiplyStrategy || <AssetsTableDataCellInactive />}
            {tooltips?.multiplyStrategy && <AssetsTableTooltip {...tooltips.multiplyStrategy} />}
          </>
        ),
        maxMultiple: {
          sortable: maxMultiply?.toNumber() || 0,
          value: (
            <>
              {maxMultiply ? `${maxMultiply.toFixed(2)}x` : <AssetsTableDataCellInactive />}
              {tooltips?.maxMultiply && <AssetsTableTooltip {...tooltips.maxMultiply} />}
            </>
          ),
        },
        liquidityAvailable: {
          sortable: liquidity?.toNumber() || 0,
          value: (
            <>
              {liquidity ? `$${formatFiatBalance(liquidity)}` : <AssetsTableDataCellInactive />}
              {tooltips?.liquidity && <AssetsTableTooltip {...tooltips.liquidity} />}
            </>
          ),
        },
        borrowRate: {
          sortable: fee ? fee.toNumber() : 0,
          value: (
            <>
              {fee ? formatDecimalAsPercent(fee) : <AssetsTableDataCellInactive />}
              {tooltips?.fee && <AssetsTableTooltip {...tooltips.fee} />}
            </>
          ),
        },
      }
    case ProductHubProductType.Earn:
      return {
        strategy: (
          <>
            {earnStrategy || <AssetsTableDataCellInactive />}
            {tooltips?.earnStrategy && <AssetsTableTooltip {...tooltips.earnStrategy} />}
          </>
        ),
        management: (
          <>
            {managementType ? (
              <Trans i18nKey={`product-hub.table.${managementType}`} />
            ) : (
              <AssetsTableDataCellInactive />
            )}
            {tooltips?.managementType && <AssetsTableTooltip {...tooltips.managementType} />}
          </>
        ),
        '7DayNetApy': {
          sortable: weeklyNetApy?.toNumber() || 0,
          value: (
            <>
              {weeklyNetApy ? (
                formatDecimalAsPercent(weeklyNetApy)
              ) : (
                <AssetsTableDataCellInactive />
              )}
              {tooltips?.weeklyNetApy && <AssetsTableTooltip {...tooltips.weeklyNetApy} />}
            </>
          ),
        },
        liquidityAvailable: {
          sortable: liquidity?.toNumber() || 0,
          value: (
            <>
              {liquidity ? `$${formatFiatBalance(liquidity)}` : <AssetsTableDataCellInactive />}
              {tooltips?.liquidity && <AssetsTableTooltip {...tooltips.liquidity} />}
            </>
          ),
        },
      }
  }
}

export function parseRows(
  rows: ProductHubItem[],
  product: ProductHubProductType,
): AssetsTableRowData[] {
  return rows.map((row) => {
    const { depositToken, label, network, primaryToken, protocol, reverseTokens, secondaryToken } =
      row
    const icons = primaryToken === secondaryToken ? [primaryToken] : [primaryToken, secondaryToken]
    const asset = product === ProductHubProductType.Earn ? depositToken || primaryToken : label

    if (reverseTokens) icons.reverse()

    const url = getActionUrl({ ...row, product: [product] })
    const urlDisabled = url === '/'

    return {
      [product === ProductHubProductType.Earn ? 'depositToken' : 'collateralDebt']: (
        <AssetsTableDataCellAsset asset={asset} icons={icons} />
      ),
      ...parseProduct(row, product),
      protocolNetwork: (
        <ProtocolLabel
          network={Array.isArray(network) ? network[0] : network}
          protocol={protocol}
        />
      ),
      action: (
        <AssetsTableDataCellAction
          cta={urlDisabled ? 'Coming soon' : upperFirst(product)}
          link={url}
          disabled={urlDisabled}
        />
      ),
    }
  })
}
