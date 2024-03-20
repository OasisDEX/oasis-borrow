import { useAppConfig } from 'helpers/config'
import React, { Fragment, useRef } from 'react'
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
  disableMaxHeight?: boolean
}

export function SidebarSectionContent({
  activePanel,
  content,
  disableMaxHeight = true,
}: SidebarSectionContentProps) {
  const { DisableSidebarScroll } = useAppConfig('features')
  const ref = useRef<HTMLDivElement>(null)
  return (
    <Box
      ref={ref}
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
          backgroundColor:
            ref.current && ref.current.scrollHeight > ref.current.offsetHeight
              ? theme.colors.secondary60
              : 'transparent',
          borderRadius: theme.radii.large,
        },
        ...(!disableMaxHeight && {
          overflowY: 'auto',
          overflowX: 'hidden',
        }),
        mr: 2,
        p: '24px',
        pr: '10px',
        ...(!DisableSidebarScroll && !disableMaxHeight && { maxHeight: 490 }),
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
