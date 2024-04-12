import type { NetworkIds } from 'blockchain/networks'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableTooltip } from 'components/assetsTable/cellComponents/AssetsTableTooltip'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { OmniProductType } from 'features/omni-kit/types'
import { getGenericPositionUrl, parseProduct } from 'features/productHub/helpers'
import type { ProductHubColumnKey, ProductHubItem } from 'features/productHub/types'
import { omit, upperFirst } from 'lodash'
import React from 'react'

interface ParseRowsParams {
  hiddenColumns?: ProductHubColumnKey[]
  networkId?: NetworkIds
  onRowClick?: (row: ProductHubItem) => void
  product: OmniProductType
  rows: ProductHubItem[]
}

export function parseRows({
  hiddenColumns,
  networkId,
  onRowClick,
  product,
  rows,
}: ParseRowsParams): AssetsTableRowData[] {
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

    const items = omit(
      {
        [product === OmniProductType.Earn ? 'depositToken' : 'collateralDebt']: (
          <AssetsTableDataCellAsset
            asset={asset}
            icons={icons}
            {...(tooltips?.asset && {
              addon: <AssetsTableTooltip {...tooltips.asset} />,
            })}
          />
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
            cta={isUrlDisabled ? 'Coming soon' : upperFirst(product)}
            link={url}
            disabled={isUrlDisabled}
          />
        ),
      },
      hiddenColumns ?? [],
    )

    return {
      items,
      ...(onRowClick && {
        onClick: () => onRowClick(row),
      }),
    }
  })
}
