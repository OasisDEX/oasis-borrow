import type { ReactNode } from 'react'
import React from 'react'
import { Card, Flex, Image, SxStyleProp, Text } from 'theme-ui'
type HomepagePromoBlockProps = {
  background: string
  title: string | ReactNode
  width?: string
  height?: string
  image?: string
  bottomTitle?: boolean
  sx?: SxStyleProp
  imageSx?: SxStyleProp
}

const HomepagePromoBlock = ({
  background,
  title,
  height = '390px',
  width = '390px',
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
            mx: 3,
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
