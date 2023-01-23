import { ListWithIcon } from 'components/ListWithIcon'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Image, Text } from 'theme-ui'

export function AjnaBorrowFormContentRisk() {
  const { t } = useTranslation()
  return (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('ajna.risk.intro')}
      </Text>
      <ListWithIcon
        icon="checkmark"
        iconSize="14px"
        iconColor="primary100"
        items={t<string, string[]>('ajna.risk.bullet-points', {
          returnObjects: true,
        })}
        listStyle={{ mt: 2 }}
      />
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Image src={staticFilesRuntimeUrl('/static/img/ajna-risk-warning.svg')} />
      </Box>
    </Grid>
  )
}
