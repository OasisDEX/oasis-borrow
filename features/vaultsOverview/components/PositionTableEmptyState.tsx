import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React, { ReactNode } from 'react'
import { Flex, Heading, Image, Text } from 'theme-ui'

export function PositionTableEmptyState({
  title,
  header,
  content,
}: {
  title: string
  header: ReactNode
  content: ReactNode
}) {
  return (
    <DiscoverTableContainer title={title}>
      <Flex
        sx={{
          flexDirection: 'column',
          alignItems: ['flex-start', 'center'],
          px: ['24px', 4],
          pt: 5,
          pb: '96px',
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
        <Text as="p" variant="paragraph2" sx={{ m: 0, color: 'neutral80' }}>
          {content}
        </Text>
      </Flex>
    </DiscoverTableContainer>
  )
}
