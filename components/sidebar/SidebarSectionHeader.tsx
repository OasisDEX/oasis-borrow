import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { Flex, Text } from 'theme-ui'

import {
  SidebarSectionHeaderSelect,
  SidebarSectionHeaderSelectItem,
} from './SidebarSectionHeaderSelect'

export interface SidebarSectionHeaderProps {
  title: string
  dropdown?: SidebarSectionHeaderSelectItem[]
  headerButton?: {
    label: string
    icon?: string
    action: () => void
  }
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
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 3,
        px: '24px',
        borderBottom: 'lightMuted',
      }}
    >
      <Text
        as="h2"
        variant="headerSettings"
        sx={{
          fontSize: 3,
          fontWeight: 600,
          lineHeight: '40px',
        }}
      >
        {title}
      </Text>
      {dropdown ? (
        <SidebarSectionHeaderSelect items={dropdown} onSelect={onSelect} />
      ) : headerButton ? (
        <Flex
          sx={{
            alignItems: 'center',
            color: 'link',
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
