import { getNetworkById } from 'blockchain/networks'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import { getOraclessProductUrl } from 'features/ajna/pool-finder/helpers'
import type { OraclessPoolResult } from 'features/ajna/pool-finder/types'
import type { OmniProductType } from 'features/omni-kit/types'
import { parseProduct } from 'features/productHub/helpers'
import type { ProductHubProductType } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import React from 'react'

export function parseRows(
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
      networkId,
      quoteAddress,
      quoteIcon,
      quoteToken,
      tooltips,
      weeklyNetApy,
    } = row

    const label = `${collateralToken}/${quoteToken}`
    const url = getOraclessProductUrl({
      collateralAddress,
      collateralToken,
      networkId,
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
        <ProtocolLabel network={getNetworkById(networkId).name} protocol={LendingProtocol.Ajna} />
      ),
      action: <AssetsTableDataCellAction cta={upperFirst(product)} link={url} />,
    }
  })
}
