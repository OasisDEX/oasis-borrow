import { negativeToZero } from '@oasisdex/dma-library'
import { AssetsTableDataCellInactive } from 'components/assetsTable/cellComponents/AssetsTableDataCellInactive'
import { AssetsTableTooltip } from 'components/assetsTable/cellComponents/AssetsTableTooltip'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { parseProductNumbers } from 'features/productHub/helpers'
import type { ProductHubItem } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { formatDecimalAsPercent, formatFiatBalance } from 'helpers/formatters/format'
import React from 'react'
import { Trans } from 'react-i18next'

const yieldLoopStables = [
  'SDAI/USDC Yield Loop',
  'SDAI/LUSD Yield Loop',
  'SDAI/FRAX Yield Loop',
  'SDAI/DAI Yield Loop',
]

export function parseProduct(
  {
    earnStrategy,
    fee: feeString,
    liquidity: liquidityString,
    managementType,
    maxLtv: maxLtvString,
    maxMultiply: maxMultiplyString,
    multiplyStrategy,
    tooltips,
    weeklyNetApy: weeklyNetApyString,
  }: Partial<ProductHubItem>,
  product: ProductHubProductType,
  liquidityToken?: string,
): AssetsTableRowData {
  const [fee, liquidity, maxLtv, maxMultiply, weeklyNetApy] = parseProductNumbers([
    feeString,
    liquidityString,
    maxLtvString,
    maxMultiplyString,
    weeklyNetApyString,
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
        liquidity: !liquidityToken
          ? {
              sortable: liquidity?.toNumber() || 0,
              value: (
                <>
                  {resolved.liquidity}
                  {tooltips?.liquidity && <AssetsTableTooltip {...tooltips.liquidity} />}
                </>
              ),
            }
          : `${liquidityString} ${liquidityToken}`,
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
              {earnStrategy && yieldLoopStables.includes(earnStrategy) ? (
                <AppLink href="https://dune.com/Lucianken/aave-v3-sdai-yield-multiple">
                  <WithArrow>APY</WithArrow>
                </AppLink>
              ) : weeklyNetApy ? (
                formatDecimalAsPercent(weeklyNetApy)
              ) : (
                <AssetsTableDataCellInactive />
              )}
              {tooltips?.weeklyNetApy && <AssetsTableTooltip {...tooltips.weeklyNetApy} />}
            </>
          ),
        },
        liquidity: !liquidityToken
          ? {
              sortable: liquidity?.toNumber() || 0,
              value: (
                <>
                  {resolved.liquidity}
                  {tooltips?.liquidity && <AssetsTableTooltip {...tooltips.liquidity} />}
                </>
              ),
            }
          : `${liquidityString} ${liquidityToken}`,
      }
  }
}
