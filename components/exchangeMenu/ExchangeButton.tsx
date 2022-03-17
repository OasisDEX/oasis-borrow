import { Icon } from '@makerdao/dai-ui-icons'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import React, { useState } from 'react'
import { Box, Button, Flex, SxStyleProp } from 'theme-ui'
import { provider } from 'web3-core'

import { UniswapWidget } from './UniswapWidget'

export function ExchangeButton({
  web3Provider,
  sx,
}: {
  web3Provider?: provider
  sx?: SxStyleProp
}) {
  const [isOpen, setIsOpen] = useState(false)

  const componentRef = useOutsideElementClickHandler(() => setIsOpen(false))

  return (
    <Flex ref={componentRef} sx={{ position: 'relative', mr: 2, pr: 1, ...sx }}>
      <Button variant="menuButtonRound" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <Box sx={{ transform: ['rotateZ(180deg)', null] }}>
            <Icon name="chevron_up" size="auto" width="14" />
          </Box>
        ) : (
          <Icon name="exchange" size="auto" width="20" />
        )}
      </Button>
      <Box
        sx={{
          display: isOpen ? 'block' : 'none',
          p: 0,
          position: ['fixed', 'absolute'],
          top: ['50%', 'auto'],
          left: ['50%', 'auto'],
          right: ['unset', 1],
          bottom: ['unset', 0],
          transform: ['translateY(-50%) translateX(-50%)', 'translateY(calc(100% + 10px))'],
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
