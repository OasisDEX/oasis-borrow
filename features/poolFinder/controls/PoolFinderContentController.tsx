import { NetworkIds } from 'blockchain/networks'
import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AssetsTableNoResults } from 'components/assetsTable/AssetsTableNoResults'
import { parseRows } from 'features/poolFinder/helpers'
import { OraclessPoolResult } from 'features/poolFinder/types'
import {  ProductHubProductType } from 'features/productHub/types'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface PoolFinderContentControllerProps {
  chainId: NetworkIds
  selectedProduct: ProductHubProductType
  tableData: OraclessPoolResult[]
}

export const PoolFinderContentController: FC<PoolFinderContentControllerProps> = ({
  chainId,
  selectedProduct,
  tableData,
}) => {
  const { t } = useTranslation()

  const rows = useMemo(
    () => parseRows(chainId, tableData, selectedProduct),
    [chainId, tableData, selectedProduct],
  )

  return (
    <AssetsTableContainer>
      {rows.length > 0 ? (
        <AssetsResponsiveTable rows={rows} />
      ) : (
        <AssetsTableNoResults
          header={t('discover.table.no-items')}
          content={t('discover.table.no-items-description')}
        />
      )}
    </AssetsTableContainer>
  )
}
