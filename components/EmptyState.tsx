import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Flex, Heading, Image, Text } from 'theme-ui'

type EmptyStateTypes = 'notice' | 'error'

const errorStateImages: { [key in EmptyStateTypes]: string } = {
  error: '/static/img/no-positions-error.svg',
  notice: '/static/img/no-positions.svg',
}

interface EmptyStateProps {
  header: string
  image?: string
  type?: EmptyStateTypes
}

export function EmptyState({
  children,
  header,
  image,
  type = 'notice',
}: PropsWithChildren<EmptyStateProps>) {
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
        src={staticFilesRuntimeUrl(image ?? errorStateImages[type])}
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
