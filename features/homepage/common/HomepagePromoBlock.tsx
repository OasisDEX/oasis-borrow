import type { ReactNode } from 'react'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Card, Flex, Image, Text } from 'theme-ui'

type HomepagePromoBlockProps = {
  background: string
  title: string | ReactNode
  width?: string | string[]
  height?: string | string[]
  image?: string
  bottomTitle?: boolean
  sx?: ThemeUIStyleObject
  imageSx?: ThemeUIStyleObject
}

const HomepagePromoBlock = ({
  background,
  title,
  height,
  width = ['100%', 'auto'],
  image,
  bottomTitle,
  sx,
  imageSx,
}: HomepagePromoBlockProps) => (
  <Card
    sx={{
      border: 'unset',
      height,
      width,
      background,
      transition: '0.2s opacity ease-in-out',
      maxHeight: '390px',
      overflow: 'hidden',
      ...sx,
    }}
  >
    <Flex
      sx={{
        flexDirection: bottomTitle ? 'column-reverse' : 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      {!bottomTitle && (
        <Text variant="header5" sx={{ my: '20px', mx: '12px', textAlign: 'center' }}>
          {title}
        </Text>
      )}
      {image && (
        <Image
          src={image}
          sx={{
            mx: [2, 3],
            mb: !bottomTitle ? 3 : 0,
            mt: !bottomTitle ? 0 : 3,
            userSelect: 'none',
            pointerEvents: 'none',
            ...imageSx,
          }}
        />
      )}
    </Flex>
  </Card>
)

HomepagePromoBlock.Big = ({
  background,
  height = '360px',
  children,
  sx,
}: Pick<HomepagePromoBlockProps, 'background' | 'height' | 'sx'> & { children: ReactNode }) => (
  <Card
    sx={{
      border: 'unset',
      height,
      width: '100%',
      background,
      ...sx,
    }}
  >
    {children}
  </Card>
)

export { HomepagePromoBlock }
