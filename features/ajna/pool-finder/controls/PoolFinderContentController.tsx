import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AssetsTableNoResults } from 'components/assetsTable/AssetsTableNoResults'
import { AppLink } from 'components/Links'
import { isAddress } from 'ethers/lib/utils'
import { parseRows } from 'features/ajna/pool-finder/helpers'
import type { OraclessPoolResult, PoolFinderFormState } from 'features/ajna/pool-finder/types'
import type { OmniProductType } from 'features/omni-kit/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import type { FC } from 'react'
import React, { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

interface PoolFinderContentControllerProps {
  addresses: PoolFinderFormState
  selectedProduct: OmniProductType
  tableData: OraclessPoolResult[]
}

export const PoolFinderContentController: FC<PoolFinderContentControllerProps> = ({
  addresses: { collateralToken, quoteToken },
  selectedProduct,
  tableData,
}) => {
  const { t } = useTranslation()

  const rows = useMemo(() => parseRows(tableData, selectedProduct), [tableData, selectedProduct])

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
                (collateralToken && !isAddress(collateralToken)) ||
                (quoteToken && !isAddress(quoteToken))
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
