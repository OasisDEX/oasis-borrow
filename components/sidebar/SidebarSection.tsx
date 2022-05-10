import React from 'react'
import { Card, Flex, Text } from 'theme-ui'

import { SidebarSectionSelect, SidebarSectionSelectItem } from './SidebarSectionSelect'

interface SidebarSectionProps {
  title: string
  dropdown?: SidebarSectionSelectItem[]
  content: JSX.Element | [
    {
      panel: string
      content: JSX.Element
    }
  ]
}

export function SidebarSection({ title, dropdown }: SidebarSectionProps) {
  return (
    <Card
      sx={{
        position: 'relative',
        p: '24px',
        pt: 3,
        maxHeight: 720,
        border: 'none',
      }}
    >
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 3,
          borderBottom: 'lightMuted',
        }}
      >
        <Text
          as="h2"
          variant="headerSettings"
          sx={{
            fontSize: 3,
            fontWeight: 600,
          }}
        >
          {title}
        </Text>
        {dropdown && <SidebarSectionSelect items={dropdown} />}
      </Flex>
      <p>Lorem ipsum dolor sit amet</p>
      <p>Lorem ipsum dolor sit amet</p>
      <p>Lorem ipsum dolor sit amet</p>
      <p>Lorem ipsum dolor sit amet</p>
      <p>Lorem ipsum dolor sit amet</p>
      <p>Lorem ipsum dolor sit amet</p>
      <p>Lorem ipsum dolor sit amet</p>
      <p>Lorem ipsum dolor sit amet</p>
      <p>Lorem ipsum dolor sit amet</p>
      <p>Lorem ipsum dolor sit amet</p>
    </Card>
  )
}
