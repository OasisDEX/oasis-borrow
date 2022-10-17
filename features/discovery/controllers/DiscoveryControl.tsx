import { getDiscoveryData } from 'features/discovery/api'
import { DiscoveryCards } from 'features/discovery/common/DiscoveryCards'
import { DiscoveryFilters } from 'features/discovery/common/DiscoveryFilters'
import { DiscoveryTable } from 'features/discovery/common/DiscoveryTable'
import { getDefaultSettingsState } from 'features/discovery/helpers'
import { discoveryPagesMeta } from 'features/discovery/meta'
import { DiscoveryFiltersSettings, DiscoveryPages } from 'features/discovery/types'
import { keyBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Box } from 'theme-ui'

interface DiscoveryControlProps {
  kind: DiscoveryPages
}

export function DiscoveryControl({ kind }: DiscoveryControlProps) {
  const { banner, endpoint, filters } = keyBy(discoveryPagesMeta, 'kind')[kind]
  const [settings, setSettings] = useState<DiscoveryFiltersSettings>(
    getDefaultSettingsState({ filters, kind }),
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const discoveryData = getDiscoveryData(endpoint, settings)

  useEffect(() => {
    setIsLoading(false)
  }, [discoveryData])

  return (
    <Box
      sx={{
        backgroundColor: 'neutral10',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'large',
      }}
    >
      <DiscoveryFilters
        filters={filters}
        onChange={(key, currentValue) => {
          setIsLoading(true)
          setSettings({
            ...settings,
            [key]: currentValue.value,
          })
        }}
      />
      <DiscoveryCards
        banner={banner}
        isLoading={isLoading}
        kind={kind}
        rows={discoveryData?.data?.rows}
      />
      <DiscoveryTable
        banner={banner}
        isLoading={isLoading}
        kind={kind}
        rows={discoveryData?.data?.rows}
      />
      {/* {isLoading && (
        <AppSpinner
          sx={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, margin: 'auto' }}
          variant="extraLarge"
        />
      )} */}
      {/* {rows.length === 0 && !isLoading && (
        <Text as="p" variant="paragraph2" sx={{ py: 4 }}>
          {t('discovery.table.no-entries')}
        </Text>
      )} */}
    </Box>
  )
}
