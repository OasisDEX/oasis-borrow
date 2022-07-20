import { Icon } from '@makerdao/dai-ui-icons'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import React, { useEffect, useState } from 'react'
import { Box, Button, Text } from 'theme-ui'

export interface SidebarSectionHeaderSelectItem {
  label: string
  shortLabel?: string
  icon?: string
  iconShrink?: number
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
        flexShrink: 0,
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
            size={!activeItem?.iconShrink ? '32px' : `${32 - activeItem.iconShrink * 2}px`}
            sx={{
              verticalAlign: 'text-bottom',
              m: !activeItem?.iconShrink ? 0 : `${activeItem.iconShrink}px`,
              mr: !activeItem?.iconShrink ? 1 : `${4 + activeItem.iconShrink}px`,
            }}
          />
        ) : (
          <Box
            sx={{
              width: 26,
              height: 26,
              m: '3px 7px 3px 3px',
              backgroundColor: 'neutral30',
              borderRadius: 'circle',
            }}
          />
        )}
        <Text as="span" sx={{ whiteSpace: 'nowrap' }}>
          {activeItem?.shortLabel || activeItem?.label}
        </Text>
        <ExpandableArrow
          size={13}
          direction={isExpanded ? 'up' : 'down'}
          sx={{ mt: '2px', ml: '12px' }}
        />
      </Button>
      <Box
        as="ul"
        sx={{
          listStyle: 'none',
          position: 'absolute',
          top: 40,
          right: 0,
          mt: 2,
          px: 0,
          py: '12px',
          backgroundColor: 'neutral10',
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
              color: item === activeItem ? 'primary100' : 'neutral80',
              transition: 'background-color 150ms',
              '&:hover': {
                backgroundColor: 'neutral20',
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
