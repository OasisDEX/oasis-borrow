import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

export function VaultProxyAdvantagesBox() {
  const { t } = useTranslation()
  const advantages = t<string, string[]>('proxy-advantages', { returnObjects: true })

  return (
    <Box>
      <Grid as="ul" gap={3} sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {advantages.map((advantage, k) => (
          <Text
            as="li"
            key={k}
            variant="paragraph3"
            sx={{ position: 'relative', pl: 4, color: 'text.subtitle' }}
          >
            <Icon name="checkbox" size="20px" sx={{ position: 'absolute', top: 0, left: 0 }} />
            {advantage}
          </Text>
        ))}
      </Grid>
    </Box>
  )
}
