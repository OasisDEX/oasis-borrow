import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import {
  BorrowProductCardsContainer,
  EarnProductCardsContainer,
  MultiplyProductCardsContainer,
} from 'components/productCards/ProductCardsContainer'
import { TabBar, TabSection } from 'components/TabBar'
import { WithArrow } from 'components/WithArrow'
import { AssetPageContent } from 'content/assets'
import { getAaveEnabledStrategies } from 'helpers/productCards'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

const aaveAssets = {
  // not putting this to ASSETS_PAGES cause we need feature toggles
  eth: {
    multiply: getAaveEnabledStrategies([{ strategy: 'ethusdc' }, { strategy: 'stETHusdc' }]),
    earn: getAaveEnabledStrategies([{ strategy: 'stETHeth' }]),
  },
  btc: {
    multiply: getAaveEnabledStrategies([{ strategy: 'wBTCusdc' }]),
    earn: [],
  },
}

export function AssetView({ content }: { content: AssetPageContent }) {
  const { t } = useTranslation()

  const aaveStrategies = aaveAssets[content.slug as keyof typeof aaveAssets] ?? []
  const tabs = () => {
    const borrowTab = content.borrowIlks && {
      label: t('landing.tabs.maker.borrow.tabLabel'),
      value: 'borrow',
      content: (
        <Box sx={{ mt: 5 }}>
          <BorrowProductCardsContainer strategies={{ maker: content.borrowIlks, aave: [] }} />
        </Box>
      ),
    }

    const multiplyTab = content.multiplyIlks && {
      label: t('landing.tabs.maker.multiply.tabLabel'),
      value: 'multiply',
      content: (
        <Box sx={{ mt: 5 }}>
          <MultiplyProductCardsContainer
            strategies={{ maker: content.multiplyIlks, aave: aaveStrategies.multiply }}
          />
        </Box>
      ),
    }

    const earnTab = content.earnIlks && {
      label: t('landing.tabs.maker.earn.tabLabel'),
      value: 'earn',
      content: (
        <Box sx={{ mt: 5 }}>
          <EarnProductCardsContainer
            strategies={{ maker: content.earnIlks, aave: aaveStrategies.earn }}
          />
        </Box>
      ),
    }

    return [borrowTab, multiplyTab, earnTab].filter((tab) => tab) as TabSection[]
  }

  return (
    <Grid sx={{ zIndex: 1, width: '100%', mt: 4 }}>
      <Flex sx={{ justifyContent: 'center', alignItems: 'baseline' }}>
        <Icon name={content.icon} size="64px" sx={{ mr: 2, alignSelf: 'center' }} />
        <Heading variant="header1">{content.header}</Heading>
        <Heading sx={{ ml: 2 }} variant="header3">
          ({content.symbol})
        </Heading>
      </Flex>
      <Flex sx={{ justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 980 }}>
          <Text sx={{ display: 'inline', color: 'neutral80' }} variant="paragraph1">
            {t(content.descriptionKey)}
          </Text>
          <AppLink href={t(content.link)}>
            <WithArrow sx={{ display: 'inline', color: 'interactive100', ml: 2 }}>
              <Text sx={{ display: 'inline', color: 'interactive100' }} variant="paragraph1">
                {t('learn-more-about')} {content.symbol}
              </Text>
            </WithArrow>
          </AppLink>
        </Box>
      </Flex>
      <Grid sx={{ flex: 1, position: 'relative', mt: 5, mb: '184px' }}>
        <TabBar useDropdownOnMobile variant="large" sections={tabs()} />
      </Grid>
    </Grid>
  )
}
