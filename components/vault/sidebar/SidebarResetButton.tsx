import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button } from 'theme-ui'

interface SidebarResetButtonProps {
  clear: () => void
  color?: string
  disabled?: boolean
}

export function SidebarResetButton({
  clear,
  color = 'interactive100',
  disabled = false,
}: SidebarResetButtonProps) {
  const { t } = useTranslation()

  return (
    <Box sx={{ my: 2 }}>
      <Button
        onClick={clear}
        variant="textual"
        disabled={disabled}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 0,
        }}
      >
        <Icon name="refresh" size={16} sx={{ mr: 2 }} color={color} />
        {t('reset')}
      </Button>
    </Box>
  )
}
