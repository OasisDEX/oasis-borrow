import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableNoResults } from 'components/assetsTable/AssetsTableNoResults'
import { AssetsTableRowData } from 'components/assetsTable/types'
import { useTranslation } from 'next-i18next'
import React, { FC } from 'react'

interface ProductHubTableControllerProps {
  rows: AssetsTableRowData[]
}

export const ProductHubTableController: FC<ProductHubTableControllerProps> = ({ rows }) => {
  const { t } = useTranslation()
  return (
    <>
      {rows.length > 0 ? (
        <AssetsResponsiveTable rows={rows} />
      ) : (
        <AssetsTableNoResults
          header={t('discover.table.no-items')}
          content={t('discover.table.no-items-description')}
        />
      )}
    </>
  )
}
