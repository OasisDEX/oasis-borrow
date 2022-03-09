import { Icon } from '@makerdao/dai-ui-icons'
import React, { useState, useRef } from 'react'
import { Box, Button, Flex } from 'theme-ui'
import { UniswapWidget } from './UniswapWidget'
import { provider } from 'web3-core'

export function ExchangeButton({ web3Provider }: { web3Provider?: provider}) {
  const component = useRef(null)
  const [isOpen, setIsOpen] = useState(false)


  return <Flex ref={component} sx={{ position: 'relative', mr: 2, pr: 1 }}>
     <Button
      variant="menuButtonRound"
      onClick={() => setIsOpen(!isOpen)}
      >
      {isOpen ? <Icon name="close" size="auto" width="20"/> : <Icon name="exchange" size="auto" width="32"/>}
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
      <UniswapWidget web3Provider={web3Provider} />
    </Box>
  </Flex>
}