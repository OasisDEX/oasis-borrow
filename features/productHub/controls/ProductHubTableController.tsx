import type { ActionBannerProps } from 'components/ActionBanner'
import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableNoResults } from 'components/assetsTable/AssetsTableNoResults'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface ProductHubTableControllerProps {
  banner?: ActionBannerProps
  perPage?: number
  rows: AssetsTableRowData[]
}

export const ProductHubTableController: FC<ProductHubTableControllerProps> = ({
  banner,
  perPage,
  rows,
}) => {
  const { t } = useTranslation()

  return (
    <>
      {rows.length > 0 ? (
        <AssetsResponsiveTable banner={banner} perPage={perPage} rows={rows} />
      ) : (
        <AssetsTableNoResults
          header={t('discover.table.no-items')}
          content={t('discover.table.no-items-description')}
        />
      )}
    </>
  )
}
