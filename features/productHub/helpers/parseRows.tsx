import type { NetworkIds } from 'blockchain/networks'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableDataCellInactive } from 'components/assetsTable/cellComponents/AssetsTableDataCellInactive'
import { AssetsTableTooltip } from 'components/assetsTable/cellComponents/AssetsTableTooltip'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import { BrandTag } from 'components/BrandTag'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { OmniProductType } from 'features/omni-kit/types'
import { ProductHubAutomations } from 'features/productHub/components'
import {
  filterFeaturedProducts,
  getGenericPositionUrl,
  parseProduct,
} from 'features/productHub/helpers'
import type {
  ProductHubColumnKey,
  ProductHubFeaturedFilters,
  ProductHubItem,
} from 'features/productHub/types'
import { omit } from 'lodash'
import React from 'react'

interface ParseRowsParams {
  featured?: ProductHubFeaturedFilters[]
  hiddenColumns?: ProductHubColumnKey[]
  highlighted?: ProductHubFeaturedFilters[]
  networkId?: NetworkIds
  onRowClick?: (row: ProductHubItem) => void
  product: OmniProductType
  rows: ProductHubItem[]
  stickied?: ProductHubFeaturedFilters[]
}

export function parseRows({
  featured = [],
  hiddenColumns,
  highlighted = [],
  networkId,
  onRowClick,
  product,
  rows,
  stickied = [],
}: ParseRowsParams): AssetsTableRowData[] {
  const featuredRows = filterFeaturedProducts({ filters: featured, rows })
  const highlightedRows = filterFeaturedProducts({ filters: highlighted, rows })
  const stickiedRows = filterFeaturedProducts({ filters: stickied, rows })

  return rows.map((row) => {
    const {
      depositToken,
      label,
      network,
      primaryToken,
      protocol,
      reverseTokens,
      secondaryToken,
      tooltips,
    } = row
    const icons = primaryToken === secondaryToken ? [primaryToken] : [primaryToken, secondaryToken]
    const asset = product === OmniProductType.Earn ? depositToken ?? primaryToken : label

    if (reverseTokens) icons.reverse()

    const url = getGenericPositionUrl({ ...row, networkId: networkId, product: [product] })
    const isUrlDisabled = url === '/'

    const isFeatured = featuredRows.includes(row)
    const isHighlighted = highlightedRows.includes(row)
    const isStickied = stickiedRows.includes(row)

    const items = omit(
      {
        [product === OmniProductType.Earn ? 'depositToken' : 'collateralDebt']: (
          <>
            <AssetsTableDataCellAsset
              asset={asset}
              icons={icons}
              addon={
                <>
                  {isFeatured && <BrandTag sx={{ ml: 2 }}>Featured</BrandTag>}
                  {tooltips?.asset && <AssetsTableTooltip {...tooltips.asset} />}
                </>
              }
            />
          </>
        ),
        ...parseProduct(row, product),
        protocolNetwork: (
          <ProtocolLabel
            network={Array.isArray(network) ? network[0] : network}
            protocol={protocol}
          />
        ),
        automation: row.automationFeatures?.length ? (
          <ProductHubAutomations automationFeatures={row.automationFeatures} product={product} />
        ) : (
          <AssetsTableDataCellInactive />
        ),
      },
      hiddenColumns ?? [],
    )

    return {
      items,
      isHighlighted,
      isStickied,
      ...(!isUrlDisabled && { link: url }),
      ...(onRowClick && {
        onClick: () => onRowClick(row),
      }),
    }
  })
}
