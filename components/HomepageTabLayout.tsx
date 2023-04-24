import React from 'react'
import { Flex, Text } from 'theme-ui'
import { fadeInAnimation } from 'theme/animations'

export function HomepageTabLayout(props: { paraText?: JSX.Element; cards: JSX.Element }) {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Text
        variant="paragraph2"
        sx={{
          mt: 4,
          color: 'neutral80',
          maxWidth: 617,
          textAlign: 'center',
          mb: 5,
          ...fadeInAnimation,
        }}
      >
        {props.paraText}
      </Text>
      {props.cards}
    </Flex>
  )
}
