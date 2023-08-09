import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { getOraclessProductUrl } from 'features/poolFinder/helpers/getOraclessProductUrl'
import { OraclessPoolResult } from 'features/poolFinder/types'
import { parseProduct } from 'features/productHub/helpers'
import { ProductHubProductType } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import React from 'react'

export function parseRows(
  chainId: NetworkIds,
  rows: OraclessPoolResult[],
  product: ProductHubProductType,
): AssetsTableRowData[] {
  return rows.map((row) => {
    const { collateralAddress, collateralToken, fee, liquidity, maxLtv, quoteAddress, quoteToken } =
      row

    const label = `${collateralToken}/${quoteToken}`
    const url = getOraclessProductUrl({
      chainId,
      product,
      collateralAddress,
      collateralToken,
      quoteAddress,
      quoteToken,
    })

    return {
      collateralQuote: (
        <AssetsTableDataCellAsset asset={label} icons={[collateralToken, quoteToken]} />
      ),
      ...parseProduct(
        {
          fee,
          label,
          liquidity,
          maxLtv,
        },
        product,
        quoteToken,
      ),
      protocolNetwork: (
        <ProtocolLabel network={NetworkNames.ethereumMainnet} protocol={LendingProtocol.Ajna} />
      ),
      action: <AssetsTableDataCellAction cta={upperFirst(product)} link={url} />,
    }
  })
}
