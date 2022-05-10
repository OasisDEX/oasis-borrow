import React, { Fragment, useState } from 'react'
import { Box, Card, Flex, Text } from 'theme-ui'

import { SidebarSectionSelect, SidebarSectionSelectItem } from './SidebarSectionSelect'

interface SidebarSectionProps {
  title: string
  dropdown?: SidebarSectionSelectItem[]
  content:
    | JSX.Element
    | {
        panel: string
        content: JSX.Element
      }[]
}

export function SidebarSection({ title, dropdown, content }: SidebarSectionProps) {
  const [activePanel, setActivePanel] = useState<string>(
    Array.isArray(content) ? content[0].panel : '',
  )

  return (
    <Card
      sx={{
        position: 'relative',
        p: 0,
        maxHeight: 720,
        border: 'lightMuted',
      }}
    >
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 3,
          px: '24px',
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
        {dropdown && (
          <SidebarSectionSelect
            items={dropdown}
            onSelect={(panel) => {
              setActivePanel(panel)
            }}
          />
        )}
      </Flex>
      <Box
        sx={{
          m: '24px',
          mb: 0,
        }}
      >
        {Array.isArray(content) ? (
          <>
            {content?.map((item, i) => (
              <Fragment key={i}>{activePanel === item.panel && item.content}</Fragment>
            ))}
          </>
        ) : (
          content
        )}
        <p>asd</p>
        <p>asd</p>
        <p>asd</p>
        <p>asd</p>
        <p>asd</p>
        <p>asd</p>
      </Box>
    </Card>
  )
}
