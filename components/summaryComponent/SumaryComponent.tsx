import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Flex, Image, Text } from 'theme-ui'

interface SummaryComponentProps {
  text: string
}

export function SummaryComponent({ text }: SummaryComponentProps) {
  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {text}
      </Text>
      <Flex sx={{ justifyContent: 'center' }}>
        <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
      </Flex>
    </>
  )
}
