import { negativeToZero } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableDataCellInactive } from 'components/assetsTable/cellComponents/AssetsTableDataCellInactive'
import { AssetsTableTooltip } from 'components/assetsTable/cellComponents/AssetsTableTooltip'
import { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { getOraclessProductUrl } from 'features/poolFinder/helpers/getOraclessProductUrl'
import { OraclessPoolResult } from 'features/poolFinder/types'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { formatDecimalAsPercent, formatFiatBalance } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'
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

  const resolved = {
    liquidity: liquidity ? (
      `$${formatFiatBalance(negativeToZero(liquidity))}`
    ) : (
      <AssetsTableDataCellInactive />
    ),
  }

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
        liquidity: {
          sortable: liquidity?.toNumber() || 0,
          value: (
            <>
              {resolved.liquidity}
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
        liquidity: {
          sortable: liquidity?.toNumber() || 0,
          value: (
            <>
              {resolved.liquidity}
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
        liquidity: {
          sortable: liquidity?.toNumber() || 0,
          value: (
            <>
              {resolved.liquidity}
              {tooltips?.liquidity && <AssetsTableTooltip {...tooltips.liquidity} />}
            </>
          ),
        },
      }
  }
}

export function parseRows(
  chainId: NetworkIds,
  rows: OraclessPoolResult[],
  product: ProductHubProductType,
): AssetsTableRowData[] {
  return rows.map((row) => {
    const { collateralAddress, collateralToken, quoteAddress, quoteToken } = row

    const url = getOraclessProductUrl({
      chainId,
      product: 'borrow',
      collateralAddress,
      collateralToken,
      quoteAddress,
      quoteToken,
    })

    return {
      collateralQuote: (
        <AssetsTableDataCellAsset
          asset={`${collateralToken}/${quoteToken}`}
          icons={[collateralToken, quoteToken]}
        />
      ),
      // ...parseProduct(row, product),
      protocolNetwork: (
        <ProtocolLabel network={NetworkNames.ethereumMainnet} protocol={LendingProtocol.Ajna} />
      ),
      action: <AssetsTableDataCellAction cta={upperFirst(product)} link={url} />,
    }
  })
}
