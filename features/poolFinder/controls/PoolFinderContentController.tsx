import type { NetworkIds } from 'blockchain/networks'
import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AssetsTableNoResults } from 'components/assetsTable/AssetsTableNoResults'
import { AppLink } from 'components/Links'
import { isAddress } from 'ethers/lib/utils'
import { parseRows } from 'features/poolFinder/helpers'
import type { OraclessPoolResult, PoolFinderFormState } from 'features/poolFinder/types'
import type { ProductHubProductType } from 'features/productHub/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import type { FC } from 'react'
import React, { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

interface PoolFinderContentControllerProps {
  addresses: PoolFinderFormState
  chainId: NetworkIds
  selectedProduct: ProductHubProductType
  tableData: OraclessPoolResult[]
}

export const PoolFinderContentController: FC<PoolFinderContentControllerProps> = ({
  addresses: { collateralAddress, quoteAddress },
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
          header={t('pool-finder.validation.no-results')}
          content={
            <Trans
              i18nKey={
                (collateralAddress && !isAddress(collateralAddress)) ||
                (quoteAddress && !isAddress(quoteAddress))
                  ? 'pool-finder.validation.no-results-suggest-address'
                  : 'pool-finder.validation.no-results-description'
              }
              components={{
                AppLink: <AppLink href={INTERNAL_LINKS.ajnaPoolCreator} sx={{ fontSize: 3 }} />,
              }}
            />
          }
        />
      )}
    </AssetsTableContainer>
  )
}
