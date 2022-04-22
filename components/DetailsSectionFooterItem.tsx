import React, { ReactNode } from 'react'
import { Flex, Heading, Text } from 'theme-ui'

interface DetailsSectionFooterItemProps {
  title: string
  value: string
}

export function DetailsSectionFooterItemWrapper({ children }: { children: ReactNode }) {
  return (
    <Flex
      as="ul"
      sx={{
        mx: -1,
        mt: -3,
        mb: [0, null, null, -3],
        p: 0,
        flexWrap: 'wrap',
      }}
    >
      {children}
    </Flex>
  )
}

export function DetailsSectionFooterItem({ title, value }: DetailsSectionFooterItemProps) {
  return (
    <Flex
      as="li"
      sx={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexBasis: ['100%', null, null, '25%'],
        p: 3,
        '&:nth-child(-n+3)': {
          flexGrow: 1,
        },
      }}
    >
      <Heading as="h3" variant="label" sx={{ mb: 1 }}>
        {title}
      </Heading>
      <Text as="p" variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
        {value}
      </Text>
    </Flex>
  )
}
