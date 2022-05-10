import { Icon } from '@makerdao/dai-ui-icons'
import React, { Fragment, useState } from 'react'
import { Box, Card, Flex, Text } from 'theme-ui'

import { SidebarSectionSelect, SidebarSectionSelectItem } from './SidebarSectionSelect'

interface SidebarSectionProps {
  title: string
  dropdown?: SidebarSectionSelectItem[]
  textbutton?: {
    label: string
    icon?: string
    action: () => void
  }
  content:
    | JSX.Element
    | {
        panel: string
        content: JSX.Element
      }[]
}

export function SidebarSection({ title, dropdown, textbutton, content }: SidebarSectionProps) {
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
            lineHeight: '40px',
          }}
        >
          {title}
        </Text>
        {dropdown ? (
          <SidebarSectionSelect
            items={dropdown}
            onSelect={(panel) => {
              setActivePanel(panel)
            }}
          />
        ) : textbutton ? (
          <Flex
            sx={{
              alignItems: 'center',
              color: 'link',
              fontSize: 2,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={textbutton.action}
          >
            {textbutton.icon && <Icon name={textbutton.icon} size="16px" sx={{ mr: 2 }} />}
            {textbutton.label}
          </Flex>
        ) : null}
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
