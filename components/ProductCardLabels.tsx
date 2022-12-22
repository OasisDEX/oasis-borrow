import React, { ReactNode } from 'react'
import { Flex, SxStyleProp, Text } from 'theme-ui'

interface ProductCardLabelsProps {
  labels?: {
    title: string
    value: ReactNode
  }[]
  textSx?: SxStyleProp
}

export function ProductCardLabels({ labels, textSx = {} }: ProductCardLabelsProps) {
  return (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-around' }}>
      {labels?.map(({ title, value }, index) => {
        return (
          <Flex
            key={`${index}-${title}`}
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              lineHeight: '22px',
              pb: 2,
              fontSize: '14px',
              '&:last-child': {
                pb: '0',
              },
            }}
          >
            <Text sx={{ color: 'neutral80', pb: 1, ...textSx }} variant="paragraph3">
              {title}
            </Text>
            <Text variant="boldParagraph3">{value}</Text>
          </Flex>
        )
      })}
    </Flex>
  )
}
