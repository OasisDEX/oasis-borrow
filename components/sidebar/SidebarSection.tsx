import React, { Fragment, useState } from 'react'
import { Box, Card } from 'theme-ui'

import { SidebarSectionHeader, SidebarSectionHeaderProps } from './SidebarSectionHeader'

interface SidebarSectionProps extends Omit<SidebarSectionHeaderProps, 'onSelect'> {
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
      <SidebarSectionHeader
        title={title}
        dropdown={dropdown}
        textbutton={textbutton}
        onSelect={(panel) => {
          setActivePanel(panel)
        }}
      />
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
