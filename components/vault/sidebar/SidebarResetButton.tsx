import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button } from 'theme-ui'

interface SidebarResetButtonProps {
  clear: () => void
}

export function SidebarResetButton({ clear }: SidebarResetButtonProps) {
  const { t } = useTranslation()

  return (
    <Box sx={{ my: 2 }}>
      <Button
        onClick={clear}
        variant="textual"
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 0,
        }}
      >
        <Icon name="refresh" size="16px" sx={{ mr: 2 }} />
        {t('reset')}
      </Button>
    </Box>
  )
}
