import React, { useMemo } from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Button, Flex } from 'theme-ui'

interface ActionPillsProps {
  readonly variant?: 'secondary'
  readonly active: string
  readonly items: {
    id: string
    label: string
    disabled?: boolean
    action: () => void
  }[]
  readonly wrapperSx?: ThemeUIStyleObject
  readonly itemSx?: ThemeUIStyleObject
  readonly itemButtonSx?: ThemeUIStyleObject
}

export function ActionPills({
  active,
  items,
  variant,
  wrapperSx,
  itemSx,
  itemButtonSx,
}: ActionPillsProps) {
  const secondaryVarientStyles = useMemo(
    () => ({
      py: '8px',
      px: '16px',
      fontSize: 1,
      ':first-child': {
        ml: 0,
      },
    }),
    [variant],
  )

  return (
    <Flex
      as="ul"
      sx={{ justifyContent: variant === 'secondary' ? 'flex-start' : 'center', p: 0, ...wrapperSx }}
    >
      {items.map((item) => (
        <Box as="li" sx={{ listStyle: 'none', m: 0, p: 0, ...itemSx }} key={item.id}>
          <Button
            onClick={item.action}
            variant={active === item.id ? 'pillActive' : 'pill'}
            sx={{
              mx: 1,
              ...(variant === 'secondary' && secondaryVarientStyles),
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
