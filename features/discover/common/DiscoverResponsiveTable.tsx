import { DiscoverCards } from 'features/discover/common/DiscoverCards'
import { DiscoverTable, DiscoverTableProps } from 'features/discover/common/DiscoverTable'
import React from 'react'
import { theme } from 'theme'
import { useMediaQuery } from 'usehooks-ts'

export function DiscoverResponsiveTable({
  banner,
  follow,
  isLoading = false,
  isSticky = false,
  kind,
  rows,
  skip = [],
  tooltips = [],
  onPositionClick,
  onBannerClick,
}: DiscoverTableProps) {
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)

  return isSmallerScreen ? (
    <DiscoverCards
      banner={banner}
      follow={follow}
      isLoading={isLoading}
      kind={kind}
      rows={rows}
      skip={skip}
      onBannerClick={onBannerClick}
      onPositionClick={onPositionClick}
    />
  ) : (
    <DiscoverTable
      banner={banner}
      follow={follow}
      isLoading={isLoading}
      isSticky={isSticky}
      kind={kind}
      onBannerClick={onBannerClick}
      onPositionClick={onPositionClick}
      rows={rows}
      skip={skip}
      tooltips={tooltips}
    />
  )
}
