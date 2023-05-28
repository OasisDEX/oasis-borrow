import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AssetsTableNoResults } from 'components/assetsTable/AssetsTableNoResults'
import React, { ReactNode } from 'react'

export function PositionTableEmptyState({
  title,
  header,
  content,
}: {
  title: string
  header: ReactNode
  content: ReactNode
}) {
  return (
    <AssetsTableContainer title={title}>
      <AssetsTableNoResults header={header} content={content} />
    </AssetsTableContainer>
  )
}
