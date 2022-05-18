import React, { Fragment } from 'react'
import { Box } from 'theme-ui'
import { theme } from 'theme';

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
        '&::-webkit-scrollbar': {
          width: '6px',
          borderRadius: '18px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.colors.grey.darker,
          borderRadius: '18px',
          height: '100px'
        },
        '&::-webkit-scrollbar-track': {
          marginRight: '10px',
          marginBottom: '15px',
          backgroundColor: theme.colors.grey.light,
          borderRadius: '18px',
        },
        maxHeight: 670,
        overflowY: 'auto',
        overflowX: 'hidden',
        marginRight: '10px',
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
