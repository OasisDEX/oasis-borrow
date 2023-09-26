import { AssetsCards } from 'components/assetsTable/AssetsCards'
import { AssetsTable } from 'components/assetsTable/AssetsTable'
import type { AssetsTableProps } from 'components/assetsTable/types'
import React from 'react'
import { theme } from 'theme'
import { useMediaQuery } from 'usehooks-ts'

export function AssetsResponsiveTable({
  isSticky = false,
  tooltips = [],
  ...rest
}: AssetsTableProps) {
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)

  return isSmallerScreen ? (
    <AssetsCards {...rest} />
  ) : (
    <AssetsTable isSticky={isSticky} tooltips={tooltips} {...rest} />
  )
}
