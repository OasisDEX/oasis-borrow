import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import type { ReactNode } from 'react'
import React from 'react'
import { Flex, Heading, Image, Text } from 'theme-ui'

interface AssetsTableNoResultsProps {
  header: ReactNode
  content: ReactNode
}

export function AssetsTableNoResults({ header, content }: AssetsTableNoResultsProps) {
  return (
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
      <Text as="p" variant="paragraph2" sx={{ m: 0, maxWidth: '804px', color: 'neutral80' }}>
        {content}
      </Text>
    </Flex>
  )
}
