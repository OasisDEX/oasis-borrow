import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Container, Heading } from 'theme-ui'

export function AssetView({ token }: { token: string }) {
  const { t } = useTranslation()

  return (
    <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
      <Heading as="h1" variant="header2" sx={{ textAlign: 'center', mt: 6, mb: 5 }}>
        Asset view heere {token}
      </Heading>
    </Box>
  )
}
