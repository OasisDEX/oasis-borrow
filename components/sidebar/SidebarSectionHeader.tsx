import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { Flex, Heading } from 'theme-ui'

import {
  SidebarSectionHeaderSelect,
  SidebarSectionHeaderSelectItem,
} from './SidebarSectionHeaderSelect'

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
  title: string
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
        <Heading as="p" variant="boldParagraph2">
          {title}
        </Heading>
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
