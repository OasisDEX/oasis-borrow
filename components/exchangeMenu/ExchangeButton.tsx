import { Icon } from '@makerdao/dai-ui-icons'
import { AppSpinner } from 'helpers/AppSpinner'
import { useOnClickOutside } from 'helpers/useOnClickOutside'
import React, { useState, useRef } from 'react'
import { Box, Button } from 'theme-ui'
import { UniswapWidget } from './UniswapWidget'

export function ExchangeButton() {
  const component = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  useOnClickOutside(component, () => setIsOpen(false))

  return <Box ref={component} sx={{ position: 'relative', display: 'inline-block' }}>
    <Button
      variant="menuButton" sx={{ px: 2 }}
      onClick={() => setIsOpen(!isOpen)}
      >
      <Icon name="exchange" size="auto" width="32" sx={{ mx: 1 }} />
    </Button>
    <Box sx={{
          display: isOpen ? 'block' : 'none',
          p: 0,
          position: 'absolute',
          top: 'auto',
          left: 'auto',
          right: 0,
          bottom: 0,
          transform: 'translateY(calc(100% + 10px))',
          bg: 'background',
          boxShadow: 'userSettingsCardDropdown',
          borderRadius: 'mediumLarge',
          border: 'none',
          overflowX: 'visible',
          zIndex: 0,
        }}>
          {/* todo: add withLoadingIndicator, use provider */}
      <AppSpinner variant="styles.spinner.large" />
      <UniswapWidget provider="asdf" />
    </Box>
  </Box>
}