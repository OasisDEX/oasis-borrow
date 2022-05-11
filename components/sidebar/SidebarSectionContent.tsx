import React, { Fragment } from 'react'
import { Box } from 'theme-ui'

export interface SidebarSectionContentProps {
  activePanel: string
  content:
    | JSX.Element
    | {
        panel: string
        content: JSX.Element
      }[]
}

export function SidebarSectionContent({ activePanel, content }: SidebarSectionContentProps) {
  return (
    <Box
      sx={{
        p: '24px',
        pt: 0,
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
    </Box>
  )
}
