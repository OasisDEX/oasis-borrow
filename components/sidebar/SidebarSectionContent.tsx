import React, { Fragment, useEffect, useRef, useState } from 'react'
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
  const contanierRef = useRef<HTMLDivElement>(null)
  const [overflowedConent, setOverflowedConent] = useState(false)

  useEffect(() => {
    if (contanierRef.current) {
      const hasOverflowingChildren =
        contanierRef.current.offsetHeight < contanierRef.current.scrollHeight
      setOverflowedConent(hasOverflowingChildren)
    }
  })

  return (
    <Box
      ref={contanierRef}
      sx={{
        '&::-webkit-scrollbar': {
          width: '6px',
          borderRadius: theme.radii.large,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.colors.secondary100,
          borderRadius: theme.radii.large,
        },
        '&::-webkit-scrollbar-track': {
          my: '24px',
          mr: '10px',
          backgroundColor: theme.colors.secondary60,
          borderRadius: theme.radii.large,
        },
        maxHeight: 490,
        overflowY: 'auto',
        overflowX: 'hidden',
        mr: overflowedConent ? '8px' : '0px',
        p: '24px',
        pr: overflowedConent ? '10px' : '24px',
      }}
    >
      <Box>
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
    </Box>
  )
}
