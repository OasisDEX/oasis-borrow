import React, { useMemo } from 'react'
import { Box, Button, Flex } from 'theme-ui'

interface ActionPillsProps {
  varient?: 'secondary'
  active: string
  items: {
    id: string
    label: string
    action: () => void
  }[]
}

export function ActionPills({ active, items, varient }: ActionPillsProps) {
  const secondaryVarientStyles = useMemo(
    () => ({
      py: '8px',
      px: '16px',
      fontSize: 1,
    }),
    [varient],
  )

  return (
    <Flex as="ul" sx={{ justifyContent: varient === 'secondary' ? 'flex-start' : 'center', p: 0 }}>
      {items.map((item, k) => (
        <Box as="li" sx={{ listStyle: 'none', m: 0, p: 0 }} key={k}>
          <Button
            onClick={item.action}
            variant={active === item.id ? 'pillActive' : 'pill'}
            sx={{
              mx: 1,
              ...(varient === 'secondary' && secondaryVarientStyles),
            }}
          >
            {item.label}
          </Button>
        </Box>
      ))}
    </Flex>
  )
}
