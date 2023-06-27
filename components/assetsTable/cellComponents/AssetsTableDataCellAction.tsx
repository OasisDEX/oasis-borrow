import { AppLink } from 'components/Links'
import React from 'react'
import { Box, Button, Flex } from 'theme-ui'

interface AssetsTableDataCellActionProps {
  cta?: string
  disabled?: boolean
  link?: string
  newTab?: boolean
  onClick?: () => void
}

export function AssetsTableDataCellAction({
  cta = 'View',
  disabled = false,
  link,
  newTab = false,
  onClick,
}: AssetsTableDataCellActionProps) {
  return (
    <Flex sx={{ justifyContent: 'flex-end' }}>
      {link ? (
        <AppLink
          href={link}
          sx={{ flexGrow: [1, null, null, 'initial'], pointerEvents: disabled ? 'none' : 'auto' }}
          internalInNewTab={newTab}
        >
          <AssetsTableDataCellAction cta={cta} disabled={disabled} onClick={onClick} />
        </AppLink>
      ) : (
        <Button
          variant="tertiary"
          sx={{ width: ['100%', null, null, 'auto'] }}
          disabled={disabled}
          onClick={onClick}
        >
          <Box
            sx={{
              display: ['none', null, null, 'block'],
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />
          {cta}
        </Button>
      )}
    </Flex>
  )
}
