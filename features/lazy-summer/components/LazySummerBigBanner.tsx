import { Banner } from 'components/Banner'
import { Icon } from 'components/Icon'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'
import { sparks } from 'theme/icons'
import { Flex, Text } from 'theme-ui'

export const LazySummerBigBannerBestRates = () => {
  return (
    <Banner
      title="Earn the best rates all of the time"
      description={
        <Flex sx={{ flexDirection: 'column', gap: 2 }}>
          <Text>
            Get effortless access to DeFi’s highest quality yields, continually optimized all of the
            time.
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
        </Flex>
      }
      image={{
        src: '/static/img/lazy_summer/best-rates-banner.svg',
      }}
      button={{
        sx: {
          background: 'linear-gradient(90deg, #FF49A4 0%, #B049FF 93%)',
          border: 'unset',
          color: 'white',
        },
        action: () => {
          window.open(EXTERNAL_LINKS.LAZY_SUMMER, '_blank')
        },

        text: 'Start Earning now',
      }}
    />
  )
}

export const LazySummerBigBannerBeatBenchmark = () => {
  return (
    <Banner
      title="Beat the benchmark. Don’t leave yield on the table"
      description={
        <Flex sx={{ flexDirection: 'column', gap: 2 }}>
          <Text>
            Get effortless access to DeFi’s best yields, continually optimized from industry
            benchmarks such as Dai (Sky) Savings Rate, to DeFi money markets such as Morpho.
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
        </Flex>
      }
      image={{
        src: '/static/img/lazy_summer/beat-benchmark-banner.svg',
      }}
      button={{
        sx: {
          background: 'linear-gradient(90deg, #FF49A4 0%, #B049FF 93%)',
          border: 'unset',
          color: 'white',
        },
        action: () => {
          window.open(EXTERNAL_LINKS.LAZY_SUMMER, '_blank')
        },

        text: 'Try it now',
      }}
      sx={{
        mt: 3,
      }}
    />
  )
}
