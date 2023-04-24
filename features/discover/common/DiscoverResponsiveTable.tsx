import { DiscoverCards } from 'features/discover/common/DiscoverCards'
import { DiscoverTable, DiscoverTableProps } from 'features/discover/common/DiscoverTable'
import React from 'react'
import { theme } from 'theme'
import { useMediaQuery } from 'usehooks-ts'

export function DiscoverResponsiveTable({
  isSticky = false,
  tooltips = [],
  ...rest
}: DiscoverTableProps) {
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)

  return isSmallerScreen ? (
    <DiscoverCards {...rest} />
  ) : (
    <DiscoverTable isSticky={isSticky} tooltips={tooltips} {...rest} />
  )
}
