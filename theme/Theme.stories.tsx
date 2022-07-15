import { Icon } from '@makerdao/dai-ui-icons'
import { ColorPalette, TypeScale } from '@theme-ui/style-guide'
import React from 'react'
import { theme } from 'theme'
import { Box, Button, Container, Flex, Grid, Heading, Link, Text } from 'theme-ui'

import { InjectTokenIconsDefs } from './tokenIcons'

export const Typography = () => {
  const textStyles = Object.keys(theme.text)

  return (
    <Container>
      <Heading as="h1" sx={{ my: 4, fontSize: 7 }}>
        Typography
      </Heading>
      <Heading sx={{ mt: 4, fontSize: 5 }}>Font family</Heading>
      <Grid sx={{ my: 2 }} gap="10px">
        {Object.entries(theme.fonts).map(([font, value]) => (
          <Box bg="white" key={font} sx={{ py: 2, fontFamily: font }}>{`${font}: ${value}`}</Box>
        ))}
      </Grid>
      <Heading sx={{ mt: 4, fontSize: 5 }}>Type scale</Heading>
      <Box bg="white">
        <TypeScale />
      </Box>
      <Heading sx={{ mt: 4, fontSize: 5 }}>Text variants</Heading>
      <Flex sx={{ flexWrap: 'wrap' }}>
        {textStyles.map((style, idx) => (
          <Box
            bg="white"
            p={3}
            sx={{ display: 'flex', alignItems: 'flex-end', m: 3, p: 4, position: 'relative' }}
            key={idx}
          >
            <Text sx={{ position: 'absolute', top: 0 }}>{style}</Text>
            <Text key={style} variant={style} sx={{ textTransform: 'capitalize' }}>
              {style}
            </Text>
          </Box>
        ))}
      </Flex>
    </Container>
  )
}

export const Colors = () => (
  <Container>
    <Heading as="h1" sx={{ my: 4, fontSize: 7 }}>
      Colors
    </Heading>
    <ColorPalette />
  </Container>
)

export const ThemeElements = () => {
  const SizePreview = ({ sizes }: { sizes: number[] }) => {
    return (
      <Grid>
        {sizes.map((size, index) => (
          <Flex sx={{ alignItems: 'center' }} key={index}>
            <Box key={size} sx={{ width: `${size}px`, height: '10px', bg: 'primary100' }} />
            <Box px={2}>{size}px</Box>
            <Box px={2}>index: {index}</Box>
          </Flex>
        ))}
      </Grid>
    )
  }

  const sizes: number[] = theme.sizes
  const space: number[] = theme.space

  return (
    <Container>
      <Heading as="h1" sx={{ my: 4, fontSize: 7 }}>
        Theme elements
      </Heading>
      <Heading sx={{ mt: 4, fontSize: 5 }}>Sizes</Heading>
      <Text>Used for:</Text>
      <Text>width, height, min-width, max-width, min-height, max-height</Text>
      <SizePreview sizes={sizes} />
      <Heading sx={{ mt: 4, fontSize: 5 }}>Spaces</Heading>
      <Text>Used for:</Text>
      <Text>
        margin, margin-top, margin-right, margin-bottom, margin-left, padding, padding-top,
        padding-right, padding-bottom, padding-left, grid-gap, grid-column-gap, grid-row-gap
      </Text>
      <SizePreview sizes={space} />
      <Heading sx={{ mt: 4, fontSize: 5 }}>Borders styles</Heading>
    </Container>
  )
}

export const Components = () => {
  const buttons = Object.keys(theme.buttons)
  const links = Object.keys(theme.links)

  return (
    <Container>
      <Heading sx={{ mt: 4, fontSize: 5 }}>Components</Heading>
      <Heading sx={{ mt: 4, fontSize: 5 }}>Buttons</Heading>
      <Grid
        sx={{ gridTemplateColumns: 'repeat(5, 1fr)', maxWidth: '1000px', justifyItems: 'start' }}
      >
        {buttons.map((variant) => (
          <Box sx={{ position: 'relative', bg: 'white', m: 3, p: 3 }} key={variant}>
            <Text sx={{ position: 'absolute', top: 0, transform: 'translateY(-90%)' }}>
              {variant}
            </Text>
            <Button variant={variant}>Click me</Button>
          </Box>
        ))}
      </Grid>
      <Heading sx={{ mt: 4, fontSize: 5 }}>Links</Heading>
      <Flex sx={{ my: 3 }}>
        {links.map((variant) => (
          <Box sx={{ position: 'relative', bg: 'white', m: 3, p: 3 }} key={variant}>
            <Text sx={{ position: 'absolute', top: 0, transform: 'translateY(-90%)' }}>
              {variant}
            </Text>
            <Link href="#" variant={variant}>
              Click me
            </Link>
          </Box>
        ))}
        <Box sx={{ position: 'relative', bg: 'white', m: 3, p: 3 }}>
          <Text sx={{ position: 'absolute', top: 0, transform: 'translateY(-90%)' }}>Default</Text>
          <Link href="#">Click me</Link>
        </Box>
      </Flex>
    </Container>
  )
}

export const Icons = () => {
  const icons = Object.keys(theme.icons)

  return (
    <Container>
      <Heading as="h1" sx={{ my: 4, fontSize: 7 }}>
        Icons
      </Heading>
      <InjectTokenIconsDefs />
      <Flex sx={{ my: 3, flexWrap: 'wrap' }}>
        {icons.map((icon) => (
          <Box sx={{ position: 'relative', bg: 'white', m: 3, p: 3 }} key={icon}>
            <Text variant="paragraph4">{icon}</Text>
            <Icon size="40px" name={icon}>
              Click me
            </Icon>
          </Box>
        ))}
      </Flex>
    </Container>
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'Theme',
}
