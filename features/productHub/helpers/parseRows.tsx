import type { NetworkIds } from 'blockchain/networks'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableTooltip } from 'components/assetsTable/cellComponents/AssetsTableTooltip'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import { BrandTag } from 'components/BrandTag'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { OmniProductType } from 'features/omni-kit/types'
import {
  filterFeaturedProducts,
  getGenericPositionUrl,
  parseProduct,
} from 'features/productHub/helpers'
import type {
  ProductHubColumnKey,
  ProductHubFeaturedProducts,
  ProductHubItem,
} from 'features/productHub/types'
import { isEqual, omit } from 'lodash'
import React from 'react'

interface ParseRowsParams {
  featured: ProductHubFeaturedProducts
  hiddenColumns?: ProductHubColumnKey[]
  networkId?: NetworkIds
  onRowClick?: (row: ProductHubItem) => void
  product: OmniProductType
  rows: ProductHubItem[]
}

export function parseRows({
  featured,
  hiddenColumns,
  networkId,
  onRowClick,
  product,
  rows,
}: ParseRowsParams): AssetsTableRowData[] {
  const featuredRows = filterFeaturedProducts({ filters: featured, product, rows })

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

    const isFeatured = featuredRows.some((_row) => isEqual(_row, row))

    const items = omit(
      {
        [product === OmniProductType.Earn ? 'depositToken' : 'collateralDebt']: (
          <>
            <AssetsTableDataCellAsset
              asset={asset}
              icons={icons}
              addon={
                <>
                  {isFeatured && featured.isTagged && <BrandTag sx={{ ml: 2 }}>Featured</BrandTag>}
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
      },
      hiddenColumns ?? [],
    )

    return {
      items,
      isHighlighted: isFeatured && featured.isHighlighted,
      isStickied: isFeatured && (featured.isStickied || featured.isPromoted),
      ...(!isUrlDisabled && { link: url }),
      ...(onRowClick && {
        onClick: () => onRowClick(row),
      }),
    }
  })
}
