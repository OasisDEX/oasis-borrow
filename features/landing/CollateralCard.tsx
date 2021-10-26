import { IlkData } from 'blockchain/ilks'
import { formatPercent } from 'helpers/formatters/format'
import { max, min } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Heading, Image, Text } from 'theme-ui'

export interface CollateralCardProps {
  title: string
  onClick(): void
  ilks: IlkData[]
  background: string
  icon: string
}
function getAnnualFeeString(ilks: IlkData[]) {
  if (ilks.length === 1) {
    return `${formatPercent(ilks[0].liquidationPenalty.times(100))}`
  }
  const liquidationPenalties = ilks.map((ilk) => ilk.liquidationPenalty)
  const maxFee = max(liquidationPenalties)!
  const minFee = min(liquidationPenalties)!

  if (maxFee.eq(minFee)) {
    return `${formatPercent(maxFee.times(100))}`
  }

  return `${formatPercent(minFee.times(100))} - ${formatPercent(maxFee.times(100))}`
}
function getCollRatioString(ilks: IlkData[]) {
  if (ilks.length === 1) {
    return `${formatPercent(ilks[0].liquidationRatio.times(100))}`
  }
  const liquidationRatios = ilks.map((ilk) => ilk.liquidationRatio)
  const maxRatio = max(liquidationRatios)!
  const minRatio = min(liquidationRatios)!

  if (maxRatio.eq(minRatio)) {
    return `${formatPercent(maxRatio.times(100))}`
  }

  return `${formatPercent(minRatio.times(100))} - ${formatPercent(maxRatio.times(100))}`
}

export function CollateralCard({ onClick, title, ilks, background, icon }: CollateralCardProps) {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        width: ['343px', '288px'],
        height: '315px',
        overflow: 'hidden',
        position: 'relative',
        p: 4,
        transition: `
          transform 0.5s cubic-bezier(0, 0.28, 0.45, 0.95),
          box-shadow 0.5s cubic-bezier(0, 0.28, 0.45, 0.95)
          `,
        borderRadius: 'large',
        boxShadow: 'surface',
        cursor: 'pointer',
        background: background,
        '& .featured-ilk-bg-image': {
          transition: `
            transform 0.5s cubic-bezier(0, 0.28, 0.45, 0.95)
          `,
        },
        '&:hover, &:focus': {
          outline: 'none',
          transform: 'scale(1.02)',
          boxShadow: 'surface_hovered',
          '& .featured-ilk-bg-image': {
            transform: 'scale(1.2)',
          },
        },
      }}
      tabIndex={0}
      onClick={onClick}
    >
      <Image
        className="featured-ilk-bg-image"
        sx={{
          transformOrigin: '50% 50%',
          transition: 'transform 0.2s',
          // maxWidth: '150%',
          position: 'absolute',
          userSelect: 'none',
          transform: 'translateX(16px)',
          right: 0,
          top: 0,
        }}
        src={icon}
      />
      <Flex sx={{ zIndex: 1, flexDirection: 'column', alignItems: 'space-between' }}>
        <Heading variant="header2" sx={{ color: 'white', minHeight: '100px', py: 3 }}>
          {title}
        </Heading>
        <Box sx={{ flex: 1 }}>
          <Text variant="paragraph3" sx={{ color: 'white', mr: 2, opacity: 0.8 }}>
            {t('system.annual-fee')}
          </Text>
          <Text variant="paragraph1" sx={{ color: 'white', mr: 2, fontWeight: 'semiBold', mt: 2 }}>
            {getAnnualFeeString(ilks)}
          </Text>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Text variant="paragraph3" sx={{ color: 'white', mr: 2, opacity: 0.8 }}>
            {t('system.min-collateral-ratio')}
          </Text>
          <Text variant="paragraph1" sx={{ color: 'white', mr: 2, fontWeight: 'semiBold', mt: 2 }}>
            {getCollRatioString(ilks)}
          </Text>
        </Box>
      </Flex>
    </Flex>
  )
}
