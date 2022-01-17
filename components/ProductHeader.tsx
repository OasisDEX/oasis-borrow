import React from 'react'
import { Flex, Heading, Text } from 'theme-ui'

import { AppLink } from './Links'

interface ProductHeaderProps {
  title: string
  description: string
  link: { href: string; text: string }
}

export function ProductHeader({ title, description, link }: ProductHeaderProps) {
  return (
    <Flex
      sx={{
        justifySelf: 'center',
        alignItems: 'center',
        textAlign: 'center',
        mt: 5,
        mb: 4,
        flexDirection: 'column',
      }}
    >
      <Heading
        as="h1"
        variant="header1"
        sx={{
          mb: 3,
        }}
      >
        {title}
      </Heading>
      <Text
        variant="paragraph1"
        sx={{
          color: 'lavender',
          mb: 3,
        }}
      >
        {description}{' '}
        <AppLink href={link.href} sx={{ fontSize: 4, fontWeight: 'body' }}>
          {link.text}
        </AppLink>
      </Text>
    </Flex>
  )
}
