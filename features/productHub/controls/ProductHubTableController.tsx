import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableNoResults } from 'components/assetsTable/AssetsTableNoResults'
import { AssetsTableRowData } from 'components/assetsTable/types'
import React, { FC } from 'react'

interface ProductHubTableControllerProps {
  rows: AssetsTableRowData[]
}

export const ProductHubTableController: FC<ProductHubTableControllerProps> = ({
  rows,
}) => {
  return (
    <>
      {rows.length > 0 ? (
        <AssetsResponsiveTable
          rows={rows}
        />
      ) : (
        <AssetsTableNoResults
          // TODO replace with translations when copy is available
          header="There are no items matching your filters"
          content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis lorem in feugiat mattis."
        />
      )}
    </>
  )
}
