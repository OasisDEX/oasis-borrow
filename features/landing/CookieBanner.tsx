import { Box, Container, Button } from 'theme-ui'
import React from 'react'
import { useTranslation, Trans } from 'react-i18next'

export default function CookieBanner() {
  const { t } = useTranslation()

  return <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0}}>
    <Container variant="landingContainer" sx={{ margin: '0 auto', px: 3 }}>
      <Box sx={{border: '1px solid black'}}>
        <Trans
            i18nKey="landing.cookie-banner.message"
            components={[
              <Button
                variant="textual"
                sx={{
                  textAlign: 'left',
                  p: 0,
                  verticalAlign: 'baseline',
                  fontSize: 'inherit',
                }}
              />,
            ]}
          />
        </Box>
    </Container>
  </Box>
}