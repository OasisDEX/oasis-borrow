import type { ReactNode } from 'react'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarFormInfoProps {
  title: ReactNode
  description: ReactNode
}

export function SidebarFormInfo({ title, description }: SidebarFormInfoProps) {
  return (
    <>
      <Text
        as="h2"
        variant="header4"
        sx={{
          fontSize: 3,
          fontWeight: 600,
          lineHeight: '22px',
        }}
      >
        {title}
      </Text>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {description}
      </Text>
    </>
  )
}
