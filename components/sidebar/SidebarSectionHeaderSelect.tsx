import { Icon } from '@makerdao/dai-ui-icons'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import React, { useEffect, useState } from 'react'
import { Box, Button, Text } from 'theme-ui'

export interface SidebarSectionHeaderSelectItem {
  label: string
  shortLabel?: string
  icon?: string
  panel?: string
  action?: () => void
}
interface SidebarSectionHeaderSelectProps {
  disabled?: boolean
  forcePanel?: string
  items: SidebarSectionHeaderSelectItem[]
  onSelect: (panel: string) => void
}

export function SidebarSectionHeaderSelect({
  disabled,
  forcePanel,
  items,
  onSelect,
}: SidebarSectionHeaderSelectProps) {
  const [activeItem, setActiveItem] = useState<SidebarSectionHeaderSelectItem>(items[0])
  const [isExpanded, setIsExpanded] = useState(false)
  const componentRef = useOutsideElementClickHandler(() => setIsExpanded(false))
  const clickHandler = (): void => {
    setIsExpanded(!isExpanded)
  }

  useEffect(() => {
    setActiveItem(items.find((item) => item.panel === forcePanel) || items[0])
  }, [forcePanel])

  return (
    <Box
      ref={componentRef}
      sx={{
        position: 'relative',
        ml: 2,
        '&:first-child': {
          ml: 0,
        },
        opacity: !disabled ? 1 : 0.5,
        cursor: !disabled ? 'default' : 'not-allowed',
        transition: 'opacity 200ms',
      }}
    >
      <Button
        variant={!isExpanded ? 'action' : 'actionActive'}
        onClick={clickHandler}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: '3px 10px 3px 3px',
          fontSize: 2,
          pointerEvents: !disabled ? 'auto' : 'none',
        }}
      >
        {activeItem?.icon ? (
          <Icon
            name={activeItem?.icon as string}
            size="32px"
            sx={{ verticalAlign: 'text-bottom', mr: 1 }}
          />
        ) : (
          <Box
            sx={{
              width: 26,
              height: 26,
              m: '3px 7px 3px 3px',
              backgroundColor: 'secondaryAlt',
              borderRadius: 'circle',
            }}
          />
        )}
        {activeItem?.shortLabel || activeItem?.label}
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
          pointerEvents: !disabled && isExpanded ? 'auto' : 'none',
          transition: 'opacity 200ms, transform 200ms',
          zIndex: 1,
        }}
      >
        {items.map((item, i) => (
          <Text
            key={i}
            as="li"
            onClick={() => {
              setIsExpanded(false)
              onSelect(item.panel!)
              if (!forcePanel) setActiveItem(items[i])
              if (item.action) item.action()
            }}
            sx={{
              py: 2,
              pl: 2,
              pr: '24px',
              fontFamily: 'body',
              fontSize: 1,
              fontWeight: 'semiBold',
              backgroundColor: 'transparent',
              color: item === activeItem ? 'primary' : 'text.muted',
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
