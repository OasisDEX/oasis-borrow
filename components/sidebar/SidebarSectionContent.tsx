import React, { Fragment } from 'react'
import { theme } from 'theme'
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
        '&::-webkit-scrollbar': {
          width: '6px',
          borderRadius: '18px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.colors.grey.darker,
          borderRadius: theme.radii.large,
        },
        '&::-webkit-scrollbar-track': {
          marginRight: '10px',
          marginBottom: '24px',
          backgroundColor: theme.colors.backgroundAlt,
          borderRadius: theme.radii.large,
        },
        maxHeight: 670,
        overflowY: 'auto',
        overflowX: 'hidden',
        marginRight: '8px',
        p: '24px',
        pr: '16px',
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
