import { Icon } from 'components/Icon'
import { useToggle } from 'helpers/useToggle'
import type { PropsWithChildren, ReactNode } from 'react'
import React from 'react'
import { chevron_down } from 'theme/icons'
import { Box, Flex, Text } from 'theme-ui'

interface SidebarAccordionProps {
  openByDefault?: boolean
  title: ReactNode
  openTitle?: string
  afterTitleComponent?: ReactNode
  additionalDescriptionComponent?: ReactNode
  isDisabled?: boolean
}

export function SidebarAccordion({
  children,
  openByDefault = false,
  openTitle,
  title,
  afterTitleComponent = null,
  additionalDescriptionComponent = null,
  isDisabled = false,
}: PropsWithChildren<SidebarAccordionProps>) {
  const [isOpen, toggleIsOpen] = useToggle(openByDefault)

  return (
    <Box sx={{ pointerEvents: isDisabled ? 'none' : 'initial', opacity: isDisabled ? 0.4 : 1 }}>
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

      {isOpen && <Box>{children}</Box>}
    </Box>
  )
}
