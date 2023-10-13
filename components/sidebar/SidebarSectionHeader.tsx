import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import type { ReactNode } from 'react'
import React from 'react'
import { Flex, Heading } from 'theme-ui'

import type { SidebarSectionHeaderSelectItem } from './SidebarSectionHeaderSelect'
import { SidebarSectionHeaderSelect } from './SidebarSectionHeaderSelect'

export interface SidebarSectionHeaderButton {
  label: string
  icon?: IconProps['icon']
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
          {headerButton.icon && <Icon icon={headerButton.icon} size="16px" sx={{ mr: 2 }} />}
          {headerButton.label}
        </Flex>
      ) : null}
    </Flex>
  )
}
