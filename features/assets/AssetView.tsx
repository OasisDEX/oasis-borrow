import { useTranslation } from 'next-i18next'
import React from 'react'
import { Container, Heading } from 'theme-ui'

export function AssetView({ token }: { token: string }) {
  const { t } = useTranslation()

  return (
    <Container sx={{ position: 'relative', zIndex: 1 }}>
      <Heading as="h1" variant="header2" sx={{ textAlign: 'center', mt: 6, mb: 5 }}>
        Asset view heere {token}
      </Heading>
    </Container>
  )
}
