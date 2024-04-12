import { negativeToZero } from '@oasisdex/dma-library'
import { AssetsTableDataCellInactive } from 'components/assetsTable/cellComponents/AssetsTableDataCellInactive'
import { AssetsTableTooltip } from 'components/assetsTable/cellComponents/AssetsTableTooltip'
import type { AssetsTableRowItems } from 'components/assetsTable/types'
import { OmniProductType } from 'features/omni-kit/types'
import { parseProductNumbers } from 'features/productHub/helpers'
import type { ProductHubItem } from 'features/productHub/types'
import { formatDecimalAsPercent, formatUsdValue } from 'helpers/formatters/format'
import React from 'react'
import { Trans } from 'react-i18next'

export function parseProduct(
  {
    earnStrategyDescription,
    fee: feeString,
    liquidity: liquidityString,
    managementType,
    maxLtv: maxLtvString,
    maxMultiply: maxMultiplyString,
    multiplyStrategy,
    tooltips,
    weeklyNetApy: weeklyNetApyString,
  }: Partial<ProductHubItem>,
  product: OmniProductType,
  liquidityToken?: string,
): AssetsTableRowItems {
  const [fee, liquidity, maxLtv, maxMultiply, weeklyNetApy] = parseProductNumbers([
    feeString,
    liquidityString,
    maxLtvString,
    maxMultiplyString,
    weeklyNetApyString,
  ])

  const resolved = {
    liquidity: liquidity ? (
      formatUsdValue(negativeToZero(liquidity))
    ) : (
      <AssetsTableDataCellInactive />
    ),
  }

  switch (product) {
    case OmniProductType.Borrow:
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
    case OmniProductType.Multiply:
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
    case OmniProductType.Earn:
      return {
        strategy: (
          <>
            {earnStrategyDescription || <AssetsTableDataCellInactive />}
            {tooltips?.earnStrategyDescription && (
              <AssetsTableTooltip {...tooltips.earnStrategyDescription} />
            )}
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
