import type { PropsWithChildren } from 'react'
import React from 'react'
import { theme } from 'theme'
import { Box, Grid } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface AssetsFiltersContainerProps {
  gridTemplateColumns: string | (string | null)[]
  isSticky?: boolean
}

export function AssetsFiltersContainer({
  gridTemplateColumns,
  children,
  isSticky = false,
}: PropsWithChildren<AssetsFiltersContainerProps>) {
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)

  return (
    <Box
      sx={{
        ...(!isSmallerScreen && {
          position: isSticky ? 'sticky' : 'relative',
          top: 0,
        }),
        py: 3,
        backgroundColor: 'neutral10',
        borderBottom: '1px solid',
        borderBottomColor: 'neutral20',
        borderTopLeftRadius: 'large',
        borderTopRightRadius: 'large',
        zIndex: 2,
      }}
    >
      <Grid sx={{ gap: '12px', gridTemplateColumns }}>{children}</Grid>
    </Box>
  )
}
