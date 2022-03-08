import { Icon } from '@makerdao/dai-ui-icons'
import { useOnClickOutside } from 'helpers/useOnClickOutside'
import React, { useState, useRef } from 'react'
import { Box, Button } from 'theme-ui'
import { UniswapWidget } from './UniswapWidget'

export function ExchangeButton() {
  const component = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  useOnClickOutside(component, () => setIsOpen(false))

  return <Box ref={component}>
    <Button
      variant="menuButton" sx={{ px: 2 }}
      onClick={() => setIsOpen(!isOpen)}
      >
      <Icon name="exchange" size="auto" width="32" sx={{ mx: 1 }} />
    </Button>
    {isOpen ? <UniswapWidget provider="asdf" /> : null}
  </Box>
}