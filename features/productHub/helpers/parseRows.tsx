import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { getActionUrl, parseProduct } from 'features/productHub/helpers'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { upperFirst } from 'lodash'
import React from 'react'

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
