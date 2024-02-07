import type { NetworkIds } from 'blockchain/networks'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { getActionUrl, parseProduct } from 'features/productHub/helpers'
import type { ProductHubColumnKey, ProductHubItem } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { omit, upperFirst } from 'lodash'
import React from 'react'

interface ParseRowsParams {
  hiddenColumns?: ProductHubColumnKey[]
  networkId?: NetworkIds
  onRowClick?: (row: ProductHubItem) => void
  product: ProductHubProductType
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
    const { depositToken, label, network, primaryToken, protocol, reverseTokens, secondaryToken } =
      row
    const icons = primaryToken === secondaryToken ? [primaryToken] : [primaryToken, secondaryToken]
    const asset = product === ProductHubProductType.Earn ? depositToken || primaryToken : label

    if (reverseTokens) icons.reverse()

    const url = getActionUrl({ ...row, networkId: networkId, product: [product] })
    const urlDisabled = url === '/'

    const items = omit(
      {
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
