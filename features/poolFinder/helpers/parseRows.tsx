import type { NetworkIds } from 'blockchain/networks'
import { NetworkNames } from 'blockchain/networks'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import type { OmniProductType } from 'features/omni-kit/types'
import { getOraclessProductUrl } from 'features/poolFinder/helpers/getOraclessProductUrl'
import type { OraclessPoolResult } from 'features/poolFinder/types'
import { parseProduct } from 'features/productHub/helpers'
import type { ProductHubProductType } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import React from 'react'

export function parseRows(
  chainId: NetworkIds,
  rows: OraclessPoolResult[],
  product: ProductHubProductType,
): AssetsTableRowData[] {
  return rows.map((row) => {
    const {
      collateralAddress,
      collateralIcon,
      collateralToken,
      earnStrategy,
      earnStrategyDescription,
      fee,
      liquidity,
      managementType,
      maxLtv,
      quoteAddress,
      quoteIcon,
      quoteToken,
      tooltips,
      weeklyNetApy,
    } = row

    const label = `${collateralToken}/${quoteToken}`
    const url = getOraclessProductUrl({
      chainId,
      collateralAddress,
      collateralToken,
      productType: product as unknown as OmniProductType,
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
          earnStrategyDescription,
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
