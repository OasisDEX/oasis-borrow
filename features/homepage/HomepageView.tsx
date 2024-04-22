import BigNumber from 'bignumber.js'
import { ImagesSlider } from 'components/ImagesSlider'
import { InfoCard } from 'components/InfoCard'
import { OmniProductType } from 'features/omni-kit/types'
import { featuredProducts } from 'features/productHub/meta'
import { ProductHubView } from 'features/productHub/views'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAsShorthandNumbers } from 'helpers/formatters/format'
import { scrollTo } from 'helpers/scrollTo'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { slideInAnimation } from 'theme/animations'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'

import { HomepageHeadline } from './common/HomepageHeadline'
import { HomepagePromoBlock } from './common/HomepagePromoBlock'
import { partnerLogosConfig } from './helpers/constants'
import type { OasisStats } from './OasisStats'
import { ReferralHandlerDynamic } from './ReferralHandlerDynamic'
import { useOasisStats } from './stats'

function WhyOasisStats({ oasisStats }: { oasisStats?: OasisStats }) {
  const { t } = useTranslation()

  return (
    <HomepagePromoBlock.Big
      background="linear-gradient(90.6deg, #D3F5FF 0%, #F2FCFF 39.53%, #FFE7D8 99.87%)"
      height={['auto ', '128px']}
      sx={{ mt: 3, pt: 4 }}
    >
      <Grid columns={['1fr', '1fr 1fr 1fr 1fr']}>
        <Flex sx={{ my: ['30px', 0], flexDirection: 'column' }}>
          <Text variant="header3" sx={{ textAlign: 'center' }}>
            {oasisStats ? oasisStats.vaultsWithActiveTrigger : '-'}
          </Text>
          <Text variant="boldParagraph2" sx={{ textAlign: 'center', color: 'neutral80' }}>
            {t('landing.stats.vaults-automated')}
          </Text>
        </Flex>
        <Flex sx={{ my: ['30px', 0], flexDirection: 'column' }}>
          <Text variant="header3" sx={{ textAlign: 'center' }}>
            {oasisStats
              ? `$${formatAsShorthandNumbers(
                  new BigNumber(oasisStats.lockedCollateralActiveTrigger),
                  2,
                )}`
              : '-'}
          </Text>
          <Text variant="boldParagraph2" sx={{ textAlign: 'center', color: 'neutral80' }}>
            {t('landing.stats.collateral-automated')}
          </Text>
        </Flex>
        <Flex sx={{ my: ['30px', 0], flexDirection: 'column' }}>
          <Text variant="header3" sx={{ textAlign: 'center' }}>
            {oasisStats ? oasisStats.executedTriggersLast90Days : '-'}
          </Text>
          <Text variant="boldParagraph2" sx={{ textAlign: 'center', color: 'neutral80' }}>
            {t('landing.stats.actions-executed')}
          </Text>
        </Flex>
        <Flex sx={{ my: ['30px', 0], flexDirection: 'column' }}>
          <Text variant="header3" sx={{ textAlign: 'center' }}>
            {oasisStats ? `${oasisStats.triggersSuccessRate}%` : '-'}
          </Text>
          <Text variant="boldParagraph2" sx={{ textAlign: 'center', color: 'neutral80' }}>
            {t('landing.stats.success-rate')}
          </Text>
        </Flex>
      </Grid>
    </HomepagePromoBlock.Big>
  )
}

export function HomepageView() {
  const { t } = useTranslation()
  const { data: oasisStats } = useOasisStats()

  return (
    <Box
      sx={{
        flex: 1,
        ...slideInAnimation,
        position: 'relative',
        animationDuration: '0.4s',
        animationTimingFunction: 'cubic-bezier(0.7, 0.01, 0.6, 1)',
      }}
    >
      <ReferralHandlerDynamic />
      <ImagesSlider items={partnerLogosConfig} />
      <Text variant="header2" sx={{ textAlign: 'center', mt: 7, mb: 6 }}>
        {t('landing.why-oasis.main-header')}
      </Text>
      <Grid columns={['1fr', '1.8fr 1.2fr']}>
        <HomepageHeadline
          primaryText={t('landing.why-oasis.sub-headers.security.primary')}
          secondaryText={t('landing.why-oasis.sub-headers.security.secondary')}
          ctaLabel={t('find-your-defi-product')}
          ctaOnClick={scrollTo('product-hub')}
          sx={{ alignSelf: 'center', mb: [5, 0] }}
        />
        <Image
          src={staticFilesRuntimeUrl('/static/img/homepage/security.svg')}
          sx={{
            height: ['auto', '300px'],
            width: ['100%', '450px'],
            justifySelf: ['center', 'right'],
          }}
        />
      </Grid>
      <Grid columns={[1, 2]} sx={{ mt: 7 }}>
        <HomepagePromoBlock.Big
          height={['auto', '100%']}
          background="linear-gradient(111.72deg, #F2FCFF 2.94%, #FFE7D8 100%), #FFFFFF"
        >
          <Flex
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Text variant="header5" sx={{ m: 3, textAlign: 'center' }}>
              {t('landing.why-oasis.image-labels.peace-of-mind')}
            </Text>
            <Image
              src={staticFilesRuntimeUrl('/static/img/homepage/peace_of_mind.svg')}
              sx={{
                width: ['100%', '528px'],
                height: ['100%', '208px'],
                my: 3,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </Flex>
        </HomepagePromoBlock.Big>
        <HomepagePromoBlock.Big
          height={['auto', '100%']}
          background="linear-gradient(147.66deg, #FFE7D8 0%, #F2FCFF 43.21%, #FEF1E1 88.25%), #FFFFFF"
        >
          <Flex
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Text variant="header5" sx={{ m: 3, textAlign: 'center' }}>
              {t('landing.why-oasis.image-labels.no-hassle')}
            </Text>
            <Image
              src={staticFilesRuntimeUrl('/static/img/homepage/no_hassle.svg')}
              sx={{
                width: ['100%', '528px'],
                height: ['100%', '208px'],
                my: 3,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </Flex>
        </HomepagePromoBlock.Big>
      </Grid>
      <WhyOasisStats oasisStats={oasisStats} />
      <Box sx={{ mt: 7 }}>
        <ProductHubView
          featured={{
            products: featuredProducts,
            limit: 1,
            isTagged: true,
            isHighlighted: true,
            isPromoted: true,
          }}
          limitRows={10}
          product={OmniProductType.Earn}
        />
      </Box>
      <Box
        sx={{
          mb: [3, 3, 6],
        }}
      >
        <Text as="p" variant="header2" sx={{ textAlign: 'center', mt: [6, 6, '205px'], mb: 4 }}>
          {t('landing.info-cards.have-some-questions')}
        </Text>
        <Grid
          gap={4}
          sx={{
            margin: 'auto',
            gridTemplateColumns: ['1fr', '1fr 1fr'],
          }}
        >
          <InfoCard
            title={t('landing.info-cards.learn.learn')}
            subtitle={t('landing.info-cards.learn.deep-dive')}
            links={[
              {
                href: EXTERNAL_LINKS.KB.GETTING_STARTED,
                text: t('landing.info-cards.learn.get-started'),
              },
              {
                href: EXTERNAL_LINKS.KB.TUTORIALS,
                text: t('landing.info-cards.learn.tutorials'),
              },
              {
                href: EXTERNAL_LINKS.KB.BORROW,
                text: t('landing.info-cards.learn.key-concepts'),
              },
            ]}
            backgroundGradient="linear-gradient(0deg, #fff 0%, #fff 100%)"
            backgroundImage="/static/img/homepage/learn.svg"
            sx={{ backgroundSize: 'cover' }}
          />
          <InfoCard
            title={t('landing.info-cards.support.support')}
            subtitle={t('landing.info-cards.support.contact-whenever')}
            links={[
              {
                href: `${EXTERNAL_LINKS.KB.HELP}/frequently-asked-questions`,
                text: t('landing.info-cards.support.faq'),
              },
              {
                href: EXTERNAL_LINKS.DISCORD,
                text: t('landing.info-cards.support.discord'),
              },
              {
                href: EXTERNAL_LINKS.TWITTER,
                text: t('landing.info-cards.support.twitter'),
              },
            ]}
            backgroundGradient="linear-gradient(0deg, #fff 0%, #fff 100%)"
            backgroundImage="/static/img/homepage/support.svg"
            sx={{ backgroundSize: 'cover' }}
          />
        </Grid>
      </Box>
    </Box>
  )
}
