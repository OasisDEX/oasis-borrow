import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import { TabBar, TabSection } from 'components/TabBar'
import { WithArrow } from 'components/WithArrow'
import { AssetPageContent } from 'content/assets'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import {
  BorrowProductCardsContainer,
  EarnProductCardsContainer,
  MultiplyProductCardsContainer,
} from '../../components/productCards/ProductCardsContainer'

export function AssetView({ content }: { content: AssetPageContent }) {
  const { t } = useTranslation()

  const tabs = () => {
    const borrowTab = content.borrowIlks && {
      label: t('landing.tabs.borrow.tabLabel'),
      value: 'borrow',
      content: (
        <Box sx={{ mt: 5 }}>
          <BorrowProductCardsContainer ilks={content.borrowIlks} />
        </Box>
      ),
    }

    const multiplyTab = content.multiplyIlks && {
      label: t('landing.tabs.multiply.tabLabel'),
      value: 'multiply',
      content: (
        <Box sx={{ mt: 5 }}>
          <MultiplyProductCardsContainer ilks={content.multiplyIlks} />
        </Box>
      ),
    }

    const earnTab = content.earnIlks && {
      label: t('landing.tabs.earn.tabLabel'),
      value: 'earn',
      content: (
        <Box sx={{ mt: 5 }}>
          <EarnProductCardsContainer ilks={content.earnIlks} />
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
