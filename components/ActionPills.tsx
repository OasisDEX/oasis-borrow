import React from 'react'
import { Box, Button, Flex } from 'theme-ui'

interface ActionPillsProps {
  active: string
  items: {
    id: string
    label: string
    action: () => void
  }[]
}

export function ActionPills({ active, items }: ActionPillsProps) {
  return (
    <Flex sx={{ justifyContent: 'center' }}>
      {items.map((item, k) => (
        <Box key={k} as="li" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          <Button
            key={k}
            onClick={item.action}
            variant={active === item.id ? 'pillActive' : 'pill'}
            sx={{
              mx: 1,
            }}
          >
            {item.label}
          </Button>
        </Box>
      ))}
    </Flex>
  )
}
