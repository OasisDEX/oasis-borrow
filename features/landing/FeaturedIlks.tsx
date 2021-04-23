import { getToken } from 'blockchain/tokensMetadata'
import { AppLink } from 'components/Links'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Image, SxStyleProp, Text } from 'theme-ui'

import { FeaturedIlk } from './featuredIlksData'

interface CallToActionProps {
  ilk: FeaturedIlk
}
function CallToActionPlaceholder() {
  return (
    <Grid
      columns="1fr 1fr"
      gap={0}
      sx={{
        flex: 1,
        cursor: 'progress',
        bg: 'ghost',
        borderRadius: 'large',
        p: 4,
        position: 'relative',
        boxShadow: 'surface',
        gridTemplateRows: 'auto 1fr auto',
        backgroundBlendMode: 'overlay',
        opacity: 0.3,
        color: 'transparent',
      }}
    >
      <Box sx={{ gridColumn: '1/3', zIndex: 1 }}>
        <Text variant="caption">title</Text>
      </Box>
      <Box sx={{ gridColumn: '1/3', zIndex: 1 }}>
        <Heading variant="header2" sx={{ color: 'transparent', minHeight: '100px' }}>
          ilk
        </Heading>
      </Box>
      <Flex sx={{ zIndex: 1 }}>
        <Text variant="paragraph3" sx={{ color: 'transparent', mr: 2 }}>
          fee
        </Text>
      </Flex>
      <Flex sx={{ zIndex: 1, gridRow: [3, 4, 3] }}>
        <Text variant="paragraph3" sx={{ color: 'transparent', mr: 2 }}>
          'ratio'
        </Text>
      </Flex>
    </Grid>
  )
}
function CallToAction({ ilk }: CallToActionProps) {
  const token = getToken(ilk.token)
  const { t } = useTranslation()

  return (
    <AppLink
      sx={{
        overflow: 'hidden',
        transition: `
          transform 0.5s cubic-bezier(0, 0.28, 0.45, 0.95),
          box-shadow 0.5s cubic-bezier(0, 0.28, 0.45, 0.95)
          `,
        borderRadius: 'large',
        boxShadow: 'surface',
        cursor: 'pointer',
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
      href={`/vaults/open/${ilk.ilk}`}
    >
      <Grid
        columns="1fr 1fr"
        gap={0}
        sx={{
          flex: 1,
          background: token.background,
          p: 4,
          color: 'white',
          position: 'relative',
          gridTemplateRows: 'auto 1fr auto',
        }}
      >
        <Image
          className="featured-ilk-bg-image"
          sx={{
            transformOrigin: '50% 50%',
            transition: 'transform 0.2s',
            maxWidth: '150%',
            position: 'absolute',
            userSelect: 'none',
            transform: 'translateX(10px)',
            right: 0,
          }}
          src={token.bannerIcon}
        />
        <Box sx={{ gridColumn: '1/3', zIndex: 1 }}>
          <Text variant="caption">{ilk.title}</Text>
        </Box>
        <Box sx={{ gridColumn: '1/3', zIndex: 1 }}>
          <Heading variant="header2" sx={{ color: 'white', minHeight: '100px' }}>
            {ilk.ilk}
          </Heading>
        </Box>
        <Flex sx={{ zIndex: 1 }}>
          <Text variant="paragraph3" sx={{ color: 'white', mr: 2 }}>
            {t('system.stability-fee')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'white', fontWeight: 'semiBold' }}>
            {formatPercent(ilk.stabilityFee.times(100), { precision: 2 })}
          </Text>
        </Flex>
        <Flex sx={{ zIndex: 1, gridRow: [3, 4, 3] }}>
          <Text variant="paragraph3" sx={{ color: 'white', mr: 2 }}>
            {t('system.min-coll-ratio')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'white', fontWeight: 'semiBold' }}>
            {formatPercent(ilk.liquidationRatio)}
          </Text>
        </Flex>
      </Grid>
    </AppLink>
  )
}

export function FeaturedIlks({ ilks, sx }: { ilks: FeaturedIlk[]; sx?: SxStyleProp }) {
  return (
    <Grid sx={sx} columns={['1fr', '1fr 1fr 1fr']} gap={4}>
      {ilks.map((ilk) => (
        <CallToAction key={ilk.title} ilk={ilk} />
      ))}
    </Grid>
  )
}

export function FeaturedIlksPlaceholder({ sx }: { sx: SxStyleProp }) {
  return (
    <Grid
      sx={{ ...sx, position: 'absolute', left: 0, top: 0, right: 0 }}
      columns={['1fr', '1fr 1fr 1fr']}
      gap={4}
    >
      <CallToActionPlaceholder />
      <CallToActionPlaceholder />
      <CallToActionPlaceholder />
    </Grid>
  )
}
