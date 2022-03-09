import { Icon } from '@makerdao/dai-ui-icons'
import { useOnClickOutside } from 'helpers/useOnClickOutside'
import React, { useRef, useState } from 'react'
import { Box, Button, Flex } from 'theme-ui'
import { provider } from 'web3-core'

import { UniswapWidget } from './UniswapWidget'

export function ExchangeButton({ web3Provider }: { web3Provider?: provider }) {
  const componentRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  useOnClickOutside(componentRef, () => setIsOpen(false))

  return (
    <Flex ref={componentRef} sx={{ position: 'relative', mr: 2, pr: 1 }}>
      <Button variant="menuButtonRound" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <Icon name="chevron_up" size="auto" width="24" />
        ) : (
          <Icon name="exchange" size="auto" width="32" />
        )}
      </Button>
      <Box
        sx={{
          display: isOpen ? 'block' : 'none',
          p: 0,
          position: 'absolute',
          top: 'auto',
          left: 'auto',
          right: 1,
          bottom: 0,
          transform: 'translateY(calc(100% + 10px))',
          bg: 'background',
          boxShadow: 'userSettingsCardDropdown',
          borderRadius: 'mediumLarge',
          border: 'none',
          overflowX: 'visible',
          zIndex: 0,
          minWidth: 7,
          minHeight: 7,
        }}
      >
        <UniswapWidget web3Provider={web3Provider} />
      </Box>
    </Flex>
  )
}
