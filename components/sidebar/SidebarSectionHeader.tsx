import React, { ReactNode } from 'react'
import { Icon } from '@makerdao/dai-ui-icons'
import {
  SidebarSectionHeaderSelect,
  SidebarSectionHeaderSelectItem,
} from 'components/sidebar/SidebarSectionHeaderSelect'
import { Flex, Heading } from 'theme-ui'

export interface SidebarSectionHeaderButton {
  label: string
  icon?: string
  action: () => void
}

export interface SidebarSectionHeaderDropdown {
  disabled?: boolean
  forcePanel?: string
  items: SidebarSectionHeaderSelectItem[]
}

export interface SidebarSectionHeaderProps {
  title: ReactNode
  dropdown?: SidebarSectionHeaderDropdown
  headerButton?: SidebarSectionHeaderButton
  onSelect: (panel: string) => void
}

export function SidebarSectionHeader({
  title,
  dropdown,
  headerButton,
  onSelect,
}: SidebarSectionHeaderProps) {
  return (
    <Flex
      sx={{
        position: 'relative',
        justifyContent: 'space-between',
        py: 3,
        mx: '24px',
        borderBottom: 'lightMuted',
        zIndex: 1,
      }}
    >
      <Flex sx={{ minHeight: 40, alignItems: 'center' }}>
        {typeof title === 'string' ? (
          <Heading
            as="p"
            variant="boldParagraph2"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {title}
          </Heading>
        ) : (
          title
        )}
      </Flex>
      {dropdown ? (
        <SidebarSectionHeaderSelect onSelect={onSelect} {...dropdown} />
      ) : headerButton ? (
        <Flex
          sx={{
            alignItems: 'center',
            color: 'interactive100',
            fontSize: 2,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={headerButton.action}
        >
          {headerButton.icon && <Icon name={headerButton.icon} size="16px" sx={{ mr: 2 }} />}
          {headerButton.label}
        </Flex>
      ) : null}
    </Flex>
  )
}
