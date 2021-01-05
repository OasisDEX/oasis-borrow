import * as React from 'react'
import { Box, Link, Text } from 'theme-ui'

export const ServerUnreachable = ({ className, ...props }: { className?: string }) => {
  return (
    <Box {...props}>
      <Box>
        <Text>Server Unreachable</Text>
      </Box>
      <Text variant="muted">
        Please try again later or{' '}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href="https://chat.makerdao.com/channel/oasis"
        >
          Contact us
        </Link>
      </Text>
    </Box>
  )
}

export const ServerUnreachableInline = ({
  className,
  fallback,
  ...props
}: {
  className?: string
  fallback?: string | React.ReactChild
}) => {
  return (
    <Box title={`Server unreachable!\nPlease try again later.`} {...props}>
      {fallback}
    </Box>
  )
}
