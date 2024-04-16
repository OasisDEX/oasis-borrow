import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import type { ReactNode } from 'react'
import React from 'react'
import { arrow_left } from 'theme/icons'
import { Button, Flex, Heading, Text } from 'theme-ui'

import type { SidebarSectionHeaderSelectItem } from './SidebarSectionHeaderSelect'
import { SidebarSectionHeaderSelect } from './SidebarSectionHeaderSelect'

export interface SidebarSectionHeaderButton {
  label: string
  icon?: IconProps['icon']
  action: () => void
}

export interface SidebarSectionHeaderBackButtonProps {
  action: () => void
  hidden?: boolean
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
  headerBackButton?: SidebarSectionHeaderBackButtonProps
  onSelect: (panel: string) => void
  step?: string
}

export function SidebarSectionHeader({
  title,
  dropdown,
  headerButton,
  onSelect,
  headerBackButton,
  step,
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
      {headerBackButton && !headerBackButton.hidden && (
        <Button variant="circle" onClick={headerBackButton.action}>
          <Icon size="14px" icon={arrow_left} />
        </Button>
      )}
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
      {step && (
        <Text
          variant="boldParagraph3"
          as="p"
          sx={{ color: 'neutral80', display: 'flex', alignItems: 'center' }}
        >
          {step}
        </Text>
      )}
    </Flex>
  )
}
