import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Flex, Heading, Image, Text } from 'theme-ui'

interface EmptyStateProps {
  header: string
}

export function EmptyState({ header, children }: PropsWithChildren<EmptyStateProps>) {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: ['flex-start', 'center'],
        px: ['24px', 4],
        py: 5,
        textAlign: ['left', 'center'],
      }}
    >
      <Image
        src={staticFilesRuntimeUrl('/static/img/no-positions.svg')}
        sx={{ alignSelf: 'center' }}
      />
      <Heading variant="boldParagraph2" sx={{ mt: 4, mb: 1 }}>
        {header}
      </Heading>
      {children && (
        <Text as="p" variant="paragraph2" sx={{ m: 0, maxWidth: '804px', color: 'neutral80' }}>
          {children}
        </Text>
      )}
    </Flex>
  )
}
