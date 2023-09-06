import React from 'react'
import { AppLink } from 'components/Links'
import { Button, Flex } from 'theme-ui'

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
          className="table-action-button"
          variant="tertiary"
          sx={{ width: ['100%', null, null, 'auto'] }}
          disabled={disabled}
          onClick={onClick}
        >
          {cta}
        </Button>
      )}
    </Flex>
  )
}
