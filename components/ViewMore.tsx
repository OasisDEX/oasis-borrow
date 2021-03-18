import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button } from 'theme-ui'

interface ViewMoreProps {
  viewMore: (e: React.SyntheticEvent<HTMLButtonElement>) => void
}

export function ViewMore({ viewMore }: ViewMoreProps) {
  const { t } = useTranslation('common')

  return (
    <Box sx={{ borderTop: 'light', borderColor: 'muted', textAlign: 'center', py: 2 }}>
      <Button variant="textual" onClick={viewMore}>
        {t('view-more')}
      </Button>
    </Box>
  )
}
