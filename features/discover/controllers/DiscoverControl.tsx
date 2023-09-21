import type { MixpanelUserContext } from 'analytics/analytics'
import { trackingEvents } from 'analytics/trackingEvents'
import { AssetsFiltersContainer } from 'components/assetsTable/AssetsFiltersContainer'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { getDiscoverData } from 'features/discover/api'
import { DiscoverData } from 'features/discover/common/DiscoverData'
import { DiscoverFilter } from 'features/discover/common/DiscoverFilters'
import { getDefaultSettingsState } from 'features/discover/helpers/getDefaultSettingsState'
import { parseBannerData } from 'features/discover/helpers/parseBannerData'
import { parseDiscoverRowData } from 'features/discover/helpers/parseDiscoverRowData'
import { discoverPagesMeta } from 'features/discover/meta'
import type { DiscoverFiltersSettings, DiscoverPages } from 'features/discover/types'
import { useAccount } from 'helpers/useAccount'
import { keyBy } from 'lodash'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { theme } from 'theme'
import { Box } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface DiscoverControlProps {
  kind: DiscoverPages
  userContext: MixpanelUserContext
}

export function DiscoverControl({ kind, userContext }: DiscoverControlProps) {
  const { i18n } = useTranslation()
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)
  const anchor = useRef<HTMLDivElement>(null)
  const { banner: rawBanner, endpoint, filters } = keyBy(discoverPagesMeta, 'kind')[kind]
  const [settings, setSettings] = useState<DiscoverFiltersSettings>(
    getDefaultSettingsState({ filters, kind }),
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { chainId, walletAddress } = useAccount()

  const response = getDiscoverData(endpoint, settings)
  const rows =
    response?.rows &&
    parseDiscoverRowData({
      chainId,
      kind,
      lang: i18n.language,
      rows: response.rows,
      walletAddress,
    })
  const banner = parseBannerData({
    banner: rawBanner,
    onClick: () => trackingEvents.discover.clickedTableBanner(kind, rawBanner.link, userContext),
  })
  const isSticky = (response && response?.rows?.length > 2) || false

  const onChangeHandler = useCallback(
    (key, currentValue) => {
      if (!isSmallerScreen) {
        const currentPosition = document.querySelector('body')?.scrollTop || 0
        const destinatedPosition = anchor.current ? anchor.current.offsetTop + 1 : 0

        if (currentPosition > destinatedPosition) {
          document.querySelector('body')?.scrollTo({ top: destinatedPosition, behavior: 'smooth' })
        }
      }
      trackingEvents.discover.selectedFilter(kind, key, currentValue, userContext)
      setIsLoading(true)
      setSettings({
        ...settings,
        [key]: currentValue,
      })
    },
    [settings],
  )

  useEffect(() => {
    if (response) setIsLoading(false)
  }, [response])

  return (
    <AssetsTableContainer>
      <Box ref={anchor} />
      <AssetsFiltersContainer
        isSticky={isSticky}
        gridTemplateColumns={['100%', null, 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
      >
        {Object.keys(filters).map((key) => (
          <DiscoverFilter filter={key} item={filters[key]} key={key} onChange={onChangeHandler} />
        ))}
      </AssetsFiltersContainer>
      <DiscoverData
        banner={banner}
        error={response?.error}
        isLoading={isLoading}
        isSticky={isSticky}
        rows={rows}
      />
    </AssetsTableContainer>
  )
}
