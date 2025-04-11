import { Icon } from 'components/Icon'
import type { FC } from 'react'
import React from 'react'
import { sparks } from 'theme/icons'
import { Box, Card, Flex, Text } from 'theme-ui'

import { LazySummerSidebarBanner } from './LazySummerSidebarBanner'
interface LazySummerSidebarContentProps {
  closeToToken: string
}

export const LazySummerSidebarContent: FC<LazySummerSidebarContentProps> = ({ closeToToken }) => {
  return (
    <Flex sx={{ flexDirection: 'column', gap: 2 }}>
      <Card
        sx={{
          background:
            'linear-gradient(90deg, rgba(255, 73, 164, 0.15) 0%, rgba(176, 73, 255, 0.15) 93%)',
          border: 'unset',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0 }}>
          <LazySummerSidebarBanner />
        </Box>
        <Text as="h5" variant="header5" sx={{ maxWidth: '285px', mb: 2 }}>
          Don’t let your {closeToToken} sit idle and earn nothing.
        </Text>
        <Text
          as="p"
          variant="paragraph3"
          sx={{ color: 'rgba(89, 111, 120, 1)', maxWidth: '335px' }}
        >
          Get effortless access to Defi’s highest quality yields through Lazy Summer.
        </Text>
      </Card>
      <Card
        sx={{
          background: '#F3F7F9',
          border: 'unset',
          gap: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Text as="p" variant="paragraph3" sx={{ fontWeight: '600' }}>
          Earn the best rates all of the time
        </Text>
        <Text as="p" variant="paragraph4" sx={{ color: 'neutral80', fontWeight: '600' }}>
          Automated rebalancing means no switching times or costs
        </Text>
        <Text as="p" variant="paragraph4" sx={{ color: 'neutral80', mb: 1 }}>
          Only the top tier protocols, with risk managed by Block Analitica
        </Text>
        <Text
          as="p"
          variant="paragraph4"
          sx={{
            background: 'linear-gradient(90deg, #FF49A4 0%, #B049FF 93%)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'white',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          <Icon icon={sparks} color="#FF49A4" /> Earn SUMR token rewards on all strategies
        </Text>
      </Card>
    </Flex>
  )
}
