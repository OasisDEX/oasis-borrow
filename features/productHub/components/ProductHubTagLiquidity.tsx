import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelProductHubChangeFilter } from 'analytics/types'
import BigNumber from 'bignumber.js'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { MIN_LIQUIDITY } from 'features/productHub/meta'
import type { ProductHubFilters } from 'features/productHub/types'
import { formatUsdValue } from 'helpers/formatters/format'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import Slider from 'rc-slider'
import React, { type FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { theme } from 'theme'
import { Box, Button, Flex, Text } from 'theme-ui'

interface ProductHubTagLiquidityProps {
  onChange: (selectedFilters: ProductHubFilters) => void
  selectedFilters: ProductHubFilters
}

export const ProductHubTagLiquidity: FC<ProductHubTagLiquidityProps> = ({
  onChange,
  selectedFilters,
}) => {
  const { t } = useTranslation()

  const [isOpen, toggleIsOpen, setIsOpen] = useToggle(false)
  const [minLiquidity, setMinLiquidity] = useState<number>(
    Number(selectedFilters?.['min-liquidity']?.[0] ?? MIN_LIQUIDITY),
  )

  const outsideRef = useOutsideElementClickHandler(() => setIsOpen(false))

  useDebouncedEffect(
    () => {
      onChange({
        ...selectedFilters,
        'min-liquidity': [minLiquidity.toString()],
      })
      trackingEvents.productHub.filterChange(
        MixpanelProductHubChangeFilter.MinLiquidity,
        minLiquidity.toString(),
      )
    },
    [minLiquidity],
    250,
  )

  return (
    <Box
      ref={outsideRef}
      as="li"
      sx={{
        position: 'relative',
        width: ['100%', null, 'auto'],
        mr: 1,
        pr: '12px',
        borderRight: ['none', null, '1px solid'],
        borderColor: ['transparent', null, 'neutral20'],
      }}
    >
      <Button
        variant={isOpen ? 'actionActive' : 'action'}
        sx={{
          position: 'relative',
          pl: 3,
          pr: '40px',
          color: 'neutral80',
          '&:hover': {
            color: 'primary100',
            borderColor: isOpen ? 'primary100' : 'neutral70',
          },
        }}
        onClick={toggleIsOpen}
      >
        {t('min-liquidity')}:{' '}
        <Text sx={{ color: 'primary100' }}>
          {formatUsdValue(
            new BigNumber(selectedFilters?.['min-liquidity']?.[0] ?? MIN_LIQUIDITY),
            0,
          )}
        </Text>
        <ExpandableArrow
          size={12}
          direction={isOpen ? 'up' : 'down'}
          sx={{
            position: 'absolute',
            top: 0,
            right: '18px',
            bottom: 0,
            my: 'auto',
          }}
        />
      </Button>
      <Box
        as="ul"
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: ['100%', null, '360px'],
          mt: 1,
          p: 3,
          border: '1px solid',
          borderColor: 'secondary100',
          borderRadius: 'medium',
          backgroundColor: 'neutral10',
          boxShadow: 'buttonMenu',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          zIndex: 1,
          transition: 'opacity 200ms, transform 200ms',
        }}
      >
        <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: '12px' }}>
          <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
            {t('min-liquidity')}
          </Text>
          <Text variant="boldParagraph3">{formatUsdValue(new BigNumber(minLiquidity), 0)}</Text>
        </Flex>
        <Slider
          step={10000}
          min={0}
          max={1000000}
          value={minLiquidity}
          styles={{
            handle: {
              width: '20px',
              height: '20px',
              marginTop: '-8px',
              backgroundColor: theme.colors.primary100,
              border: 'none',
              opacity: '1',
              boxShadow: 'none',
            },
            rail: {
              height: '4px',
              backgroundColor: theme.colors.neutral60,
              borderRadius: theme.radii.small,
            },
            track: {
              backgroundColor: theme.colors.interactive50,
            },
          }}
          onChange={(value) => {
            setMinLiquidity(Array.isArray(value) ? value[0] : value)
          }}
        />
      </Box>
    </Box>
  )
}
