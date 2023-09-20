import { MinusIcon, PlusIcon } from 'components/vault/VaultActionInput'
import type { ReactChild } from 'react'
import React from 'react'
import { Box, Button } from 'theme-ui'

interface OptionalAdjustProps {
  label: string
  isVisible?: boolean
  isExpanded: boolean
  clickHandler?: () => void
  children: ReactChild
}

export function OptionalAdjust({
  label,
  isVisible,
  isExpanded,
  clickHandler,
  children,
}: OptionalAdjustProps) {
  return (
    <>
      {isVisible && (
        <Box>
          <Button variant={`actionOption${isExpanded ? 'Opened' : ''}`} onClick={clickHandler}>
            {isExpanded ? <MinusIcon /> : <PlusIcon />}
            {label}
          </Button>
          {isExpanded && <Box>{children}</Box>}
        </Box>
      )}
    </>
  )
}
