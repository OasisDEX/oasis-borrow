import { ExpandablePlus } from 'components/dumb/ExpandablePlus'
import { useToggle } from 'helpers/useToggle'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Box, Button, Text } from 'theme-ui'

interface PillAccordionProps {
  openByDefault?: boolean
  title: string
  openTitle?: string
}

export function PillAccordion({
  children,
  openByDefault = false,
  openTitle,
  title,
}: PropsWithChildren<PillAccordionProps>) {
  const [isOpen, toggleIsOpen] = useToggle(openByDefault)

  return (
    <Box>
      <Button variant={`actionOption${isOpen ? 'Opened' : ''}`} onClick={toggleIsOpen}>
        <ExpandablePlus isOpen={isOpen} />
        <Text as="span" variant="paragraph4" sx={{ ml: '10px' }}>
          {isOpen && openTitle ? openTitle : title}
        </Text>
      </Button>

      {isOpen && (
        <Box
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'secondary60',
            borderTop: 'none',
            borderBottomLeftRadius: 'mediumLarge',
            borderBottomRightRadius: 'mediumLarge',
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  )
}
