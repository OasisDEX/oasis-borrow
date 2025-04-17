import { Icon } from 'components/Icon'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import Link from 'next/link'
import React from 'react'
import { lazy_summer_small_logo } from 'theme/icons'
import { Box, Button, Card, Flex, Text } from 'theme-ui'

const LazySummerCircle = () => {
  return (
    <Box
      sx={{
        width: '44px',
        height: '44px',
        backgroundColor: 'white',
        borderRadius: '50%',
        boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '32px',
          height: '32px',
          background:
            'linear-gradient(90deg, rgba(255, 73, 164, 0.3) 0%, rgba(176, 73, 255, 0.3) 93%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon icon={lazy_summer_small_logo} />
      </Box>
    </Box>
  )
}

export const LazySummerProductHubBanner = () => {
  return (
    <Card
      sx={{
        mt: 3,
        boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.1)',
        border: 'unset',
        paddingY: '20px',
        backgroundColor: '#FBEDFA',
      }}
    >
      <Flex
        sx={{ gap: 3, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
      >
        <Flex sx={{ gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <LazySummerCircle />
          <Flex sx={{ flexDirection: 'column' }}>
            <Text as="p" variant="paragraph3" sx={{ fontWeight: 600 }}>
              Get automated access to DeFi’s highest quality yields and earn $SUMR token rewards
            </Text>
            <Text as="p" variant="paragraph4" sx={{ color: '#777576' }}>
              Earn more while saving time and cutting costs. Effortless DeFi yield, continually
              optimized by AI powered keepers.
            </Text>
          </Flex>
        </Flex>
        <Link
          href={`${EXTERNAL_LINKS.LAZY_SUMMER}/earn`}
          target="_blank"
          style={{ textDecoration: 'none' }}
        >
          <Button
            variant="secondary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(90deg, #FF49A4 0%, #B049FF 93%)',
              height: '36px',
              width: 'fit-content',
              '&:hover': {
                opacity: 0.8,
              },
              transition: 'opacity 200ms',
            }}
          >
            <Text variant="paragraph4" sx={{ fontWeight: 600, color: 'white' }}>
              Start Earning
            </Text>
          </Button>
        </Link>
      </Flex>
    </Card>
  )
}
