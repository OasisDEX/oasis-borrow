import { Icon } from 'components/Icon'
import { useToggle } from 'helpers/useToggle'
import type { PropsWithChildren, ReactNode } from 'react'
import React from 'react'
import { chevron_down } from 'theme/icons'
import { Box, Flex, Text } from 'theme-ui'

interface SidebarAccordionProps {
  openByDefault?: boolean
  title: string
  openTitle?: string
  afterTitleComponent?: ReactNode
  additionalDescriptionComponent?: ReactNode
}

export function SidebarAccordion({
  children,
  openByDefault = false,
  openTitle,
  title,
  afterTitleComponent = null,
  additionalDescriptionComponent = null,
}: PropsWithChildren<SidebarAccordionProps>) {
  const [isOpen, toggleIsOpen] = useToggle(openByDefault)

  return (
    <Box>
      <Flex
        sx={{ flexDirection: 'row', alignItems: 'center', mb: 3, cursor: 'pointer' }}
        onClick={toggleIsOpen}
      >
        <Box>
          <Text variant="boldParagraph2">{isOpen && openTitle ? openTitle : title}</Text>
          {afterTitleComponent}
        </Box>
        <Icon
          icon={chevron_down}
          size={12}
          sx={{
            ml: 'auto',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </Flex>
      {additionalDescriptionComponent}

      {isOpen && (
        <Box
          sx={{
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
