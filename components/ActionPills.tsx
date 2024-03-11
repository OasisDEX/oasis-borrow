import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Button, Flex } from 'theme-ui'

export interface ActionPillsItem {
  id: string
  label: string
  disabled?: boolean
  action: () => void
}

interface ActionPillsProps {
  readonly variant?: 'primary' | 'secondary' | 'tertiary'
  readonly active: string
  readonly items: ActionPillsItem[]
  readonly wrapperSx?: ThemeUIStyleObject
  readonly itemSx?: ThemeUIStyleObject
  readonly itemButtonSx?: ThemeUIStyleObject
}

export function ActionPills({
  active,
  items,
  variant = 'primary',
  wrapperSx,
  itemSx,
  itemButtonSx,
}: ActionPillsProps) {
  return (
    <Flex
      as="ul"
      sx={{
        justifyContent: variant !== 'primary' ? 'flex-start' : 'center',
        columnGap: 2,
        p: 0,
        ...wrapperSx,
      }}
    >
      {items.map((item) => (
        <Box as="li" sx={{ listStyle: 'none', m: 0, p: 0, ...itemSx }} key={item.id}>
          <Button
            onClick={item.action}
            variant={active === item.id ? 'pillActive' : 'pill'}
            sx={{
              ...(variant !== 'primary' && {
                px: 3,
                py: 2,
                fontSize: 1,
              }),
              ...(variant === 'tertiary' && {
                bg: 'neutral20',
                '&:hover': {
                  bg: 'neutral60',
                },
                ...(active === item.id && {
                  '&, &:hover': {
                    bg: 'neutral80',
                    color: 'neutral10',
                  },
                }),
              }),
              ...(item.disabled && {
                opacity: 0.5,
                pointerEvents: 'none',
              }),
              ...itemButtonSx,
            }}
          >
            {item.label}
          </Button>
        </Box>
      ))}
    </Flex>
  )
}
