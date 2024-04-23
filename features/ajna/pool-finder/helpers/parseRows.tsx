import { getNetworkById } from 'blockchain/networks'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import { ProtocolLabel } from 'components/ProtocolLabel'
import type { OraclessPoolResult } from 'features/ajna/pool-finder/types'
import { getOmniPositionUrl } from 'features/omni-kit/helpers'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import type { OmniProductType } from 'features/omni-kit/types'
import { parseProduct } from 'features/productHub/helpers'
import { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import React from 'react'

export function parseRows(
  rows: OraclessPoolResult[],
  product: OmniProductType,
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
    const networkName = getNetworkById(networkId).name
    const url = getOmniPositionUrl({
      collateralAddress,
      collateralToken,
      isPoolOracless: isPoolOracless({ collateralToken, quoteToken, networkId }),
      networkName,
      pairId: 1,
      productType: product as unknown as OmniProductType,
      protocol: LendingProtocol.Ajna,
      quoteAddress,
      quoteToken,
    })

    return {
      items: {
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
      },
    }
  })
}
