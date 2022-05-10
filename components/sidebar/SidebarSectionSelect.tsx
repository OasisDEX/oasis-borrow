import { Icon } from '@makerdao/dai-ui-icons'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import React, { useState } from 'react'
import { Box, Button, Text } from 'theme-ui'

export interface SidebarSectionSelectItem {
  label: string
  shortLabel?: string
  icon?: string
  panel?: string
  action?: () => void
}
interface SidebarSectionSelectProps {
  items: SidebarSectionSelectItem[]
}

export function SidebarSectionSelect({ items }: SidebarSectionSelectProps) {
  const [active, setActive] = useState<number>(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const componentRef = useOutsideElementClickHandler(() => setIsExpanded(false))
  const clickHandler = (): void => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Box
      ref={componentRef}
      sx={{
        position: 'relative',
        ml: 2,
        '&:first-child': {
          ml: 0,
        },
      }}
    >
      <Button
        variant={!isExpanded ? 'action' : 'actionActive'}
        onClick={clickHandler}
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: '3px',
          pr: '10px',
          pl: '3px',
          fontSize: 2,
        }}
      >
        {items[active].icon ? (
          <Icon
            name={items[active].icon as string}
            size="32px"
            sx={{ verticalAlign: 'text-bottom', mr: 1 }}
          />
        ) : (
          <Box 
            sx={{
              width: 26,
              height: 26,
              my: '3px',
              mr: '7px',
              ml: '3px',
              backgroundColor: 'secondaryAlt',
              borderRadius: 'circle',
            }}
          />
        )}
        {items[active].shortLabel || items[active].label}
        <ExpandableArrow size={13} direction={isExpanded ? 'up' : 'down'} sx={{ ml: '12px' }} />
      </Button>
      <Box
        as="ul"
        sx={{
          listStyle: 'none',
          position: 'absolute',
          top: '100%',
          right: 0,
          mt: 2,
          px: 0,
          py: '12px',
          backgroundColor: 'surface',
          borderRadius: 'medium',
          boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.15)',
          opacity: isExpanded ? 1 : 0,
          transform: isExpanded ? 'translateY(0)' : 'translateY(-5px)',
          pointerEvents: isExpanded ? 'auto' : 'none',
          transition: 'opacity 200ms, transform 200ms',
        }}
      >
        {items.map((item, i) => (
          <Text
            key={i}
            as="li"
            onClick={() => {
              setIsExpanded(false)
              setActive(i)
            }}
            sx={{
              py: 2,
              pl: 2,
              pr: '24px',
              fontFamily: 'body',
              fontSize: 1,
              fontWeight: 'semiBold',
              backgroundColor: 'transparent',
              transition: 'background-color 150ms',
              '&:hover': {
                backgroundColor: 'border',
              },
              cursor: 'pointer',
              whiteSpace: 'pre',
            }}
          >
            {item.label}
          </Text>
        ))}
      </Box>
    </Box>
  )
}
