import { DiscoverCards } from 'features/discover/common/DiscoverCards'
import { DiscoverTable } from 'features/discover/common/DiscoverTable'
import { DiscoverBanner } from 'features/discover/meta'
import { DiscoverPages, DiscoverTableRowData } from 'features/discover/types'
import React, { Fragment } from 'react'
import { theme } from 'theme'
import { useMediaQuery } from 'usehooks-ts'

export function DiscoverResponsiveTable({
  banner,
  isLoading = false,
  isSticky = false,
  kind,
  rows,
  skip = [],
  onPositionClick,
  onBannerClick,
}: {
  banner?: DiscoverBanner
  isLoading?: boolean
  isSticky?: boolean
  kind?: DiscoverPages
  rows: DiscoverTableRowData[]
  skip?: string[]
  onBannerClick?: (link: string) => void
  onPositionClick?: (cdpId: string) => void
}) {
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)

  return (
    <>
      {isSmallerScreen ? (
        <DiscoverCards
          banner={banner}
          isLoading={isLoading}
          kind={kind}
          rows={rows}
          onBannerClick={onBannerClick}
          onPositionClick={onPositionClick}
        />
      ) : (
        <DiscoverTable
          banner={banner}
          isLoading={isLoading}
          isSticky={isSticky}
          kind={kind}
          rows={rows}
          skip={skip}
          onBannerClick={onBannerClick}
          onPositionClick={onPositionClick}
        />
      )}
    </>
  )
}
