import React from 'react'
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

export function parseRows(
  chainId: NetworkIds,
  rows: OraclessPoolResult[],
  product: ProductHubProductType,
): AssetsTableRowData[] {
  return rows.map((row) => {
    const {
      collateralAddress,
      collateralToken,
      earnStrategy,
      fee,
      liquidity,
      managementType,
      maxLtv,
      quoteAddress,
      quoteToken,
      tooltips,
      weeklyNetApy,
      collateralIcon,
      quoteIcon,
    } = row

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
        <AssetsTableDataCellAsset asset={label} icons={[collateralIcon, quoteIcon]} />
      ),
      ...parseProduct(
        {
          earnStrategy,
          fee,
          label,
          liquidity,
          managementType,
          maxLtv,
          tooltips,
          weeklyNetApy,
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
