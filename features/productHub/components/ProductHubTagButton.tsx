import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelProductHubChangeFilter } from 'analytics/types'
import { StatefulTooltip } from 'components/Tooltip'
import type { ProductHubFilters, ProductHubTag } from 'features/productHub/types'
import React, { type FC, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Button } from 'theme-ui'

interface ProductHubTagButtonProps {
  onChange: (selectedFilters: ProductHubFilters) => void
  selectedFilters: ProductHubFilters
  tag: ProductHubTag
}

const TOOLTIP_WIDTH = 250

export const ProductHabTagButton: FC<ProductHubTagButtonProps> = ({
  onChange,
  selectedFilters,
  tag,
}) => {
  const { t } = useTranslation()

  const ref = useRef<HTMLInputElement>(null)

  return (
    <Box ref={ref} as="li" sx={{ position: 'relative' }}>
      <StatefulTooltip
        tooltip={t(`product-hub.tags.${tag}.tooltip`)}
        tooltipSx={{
          top: '100%',
          ...(ref.current &&
          window?.innerWidth > ref.current.getBoundingClientRect().x + TOOLTIP_WIDTH
            ? {
                left: 0,
              }
            : {
                right: 0,
              }),
          width: `${TOOLTIP_WIDTH}px`,
          mt: 2,
          fontSize: 1,
          textAlign: 'left',
          border: 'none',
          borderRadius: 'medium',
          boxShadow: 'buttonMenu',
        }}
      >
        <Button
          variant={selectedFilters['tags']?.includes(tag) ? 'actionActive' : 'action'}
          sx={{
            px: 3,
            color: 'neutral80',
            '&:hover': {
              color: 'primary100',
              borderColor: selectedFilters['tags']?.includes(tag) ? 'primary100' : 'neutral70',
            },
          }}
          onClick={() => {
            const tags = selectedFilters['tags'] ?? []

            onChange({
              ...selectedFilters,
              tags: tags.includes(tag) ? tags.filter((_tag) => _tag !== tag) : [...tags, tag],
            })
            trackingEvents.productHub.filterChange(MixpanelProductHubChangeFilter.Tag, tag)
          }}
        >
          {t(`product-hub.tags.${tag}.label`)}
        </Button>
      </StatefulTooltip>
    </Box>
  )
}
