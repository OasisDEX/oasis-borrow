import { PropsWithChildren } from 'react'
import { theme } from 'theme'
import { Box, Flex } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface AssetsFiltersContainerProps {
  isSticky: boolean
}

export function AssetsFiltersContainer({
  children,
  isSticky,
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
      <Flex sx={{ gap: '12px' }}>{children}</Flex>
    </Box>
  )
}
