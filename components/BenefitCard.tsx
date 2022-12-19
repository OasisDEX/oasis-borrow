import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Flex, Grid, Image, Text } from 'theme-ui'
import { slideInAnimation } from 'theme/animations'

export function BenefitCardsWrapper({ children }: WithChildren) {
  return (
    <Grid
      columns={[1, 2, 3]}
      sx={{
        justifyItems: 'center',
        ...slideInAnimation,
        position: 'relative',
        width: '100%',
        gap: 3,
        margin: '0 auto',
      }}
    >
      {children}
    </Grid>
  )
}

interface BenefitCardProps {
  header: string
  background: string
  image: {
    src: string
    bottom: string
    width?: string
    bgWidth?: string
  }
}

export function BenefitCard({ header, background, image }: BenefitCardProps) {
  const { t } = useTranslation()

  return (
    <Card
      sx={{
        background,
        minHeight: '328px',
        maxWidth: '389px',
        position: 'relative',
        flex: 1,
        p: 4,
        border: 'unset',
        pb: 0,
      }}
    >
      <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <Text as="p" variant="boldParagraph1" sx={{ fontSize: '20px', lineHeight: '32px' }}>
          {t(header)}
        </Text>
        <Box
          sx={{
            borderRadius: '24px 24px 0px 0px',
            height: '208px',
            width: image.bgWidth || ['80%', '325px'],
            backgroundColor: 'primary100',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 0,
          }}
        />
        <Image
          src={staticFilesRuntimeUrl(image.src)}
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: image.bottom,
            width: image.width || 'auto',
          }}
        />
      </Flex>
    </Card>
  )
}
