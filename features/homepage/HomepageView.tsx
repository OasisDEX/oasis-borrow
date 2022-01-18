import { Icon } from '@makerdao/dai-ui-icons'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Heading, Image, SxStyleProp, Text, Box } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { AppLink } from '../../components/Links'
import { ProductCardsLayout } from '../../components/ProductCard'
import { ProductCardBorrow } from '../../components/ProductCardBorrow'
import { ProductCardMultiply } from '../../components/ProductCardMultiply'
import { TabSwitcher } from '../../components/TabSwitcher'
import { AppSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable, useObservableWithError } from '../../helpers/observableHook'
import { landingPageCardsData, ProductCardData } from '../../helpers/productCards'
import { staticFilesRuntimeUrl } from '../../helpers/staticPaths'
import { useFeatureToggle } from '../../helpers/useFeatureToggle'
import { slideInAnimation } from '../../theme/animations'
import { InfoCard } from '../../components/InfoCard'

function TabContent(props: {
  paraText: JSX.Element
  type: 'borrow' | 'multiply' | 'earn'
  renderProductCard: (props: { cardData: ProductCardData }) => JSX.Element
}) {
  const { productCardsData$ } = useAppContext()
  const { error: productCardsDataError, value: productCardsDataValue } = useObservableWithError(
    productCardsData$,
  )

  return (
    <WithErrorHandler error={[productCardsDataError]}>
      <WithLoadingIndicator
        value={[productCardsDataValue]}
        customLoader={
          <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
            <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
          </Flex>
        }
      >
        {([productCardsData]) => (
          <>
            <Text
              variant="paragraph2"
              sx={{ mt: 4, color: 'lavender', maxWidth: 617, textAlign: 'center', mb: 4 }}
            >
              {props.paraText}
            </Text>
            <ProductCardsLayout
              productCards={landingPageCardsData({
                productCardsData,
                product: props.type,
              }).map((cardData) => props.renderProductCard({ cardData }))}
            />
          </>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

export function HomepageView() {
  const { t } = useTranslation()
  const { context$ } = useAppContext()
  const context = useObservable(context$)
  return (
    <Box
      sx={{
        flex: 1,
      }}
    >
      here
      <Hero
        isConnected={context?.status === 'connected'}
        sx={{ ...slideInAnimation, position: 'relative' }}
      />
      <TabSwitcher
        tabs={[
          {
            tabLabel: t('landing.tabs.borrow.tabLabel'),
            tabContent: (
              <TabContent
                paraText={
                  <>
                    {t('landing.tabs.borrow.tabParaContent')}{' '}
                    <AppLink href="/borrow" variant="inText">
                      {t('landing.tabs.borrow.tabParaLinkContent')}
                    </AppLink>
                  </>
                }
                type="borrow"
                renderProductCard={ProductCardBorrow}
              />
            ),
          },
          {
            tabLabel: t('landing.tabs.multiply.tabLabel'),
            tabContent: (
              <TabContent
                paraText={
                  <>
                    {t('landing.tabs.multiply.tabParaContent')}{' '}
                    <AppLink href="/multiply" variant="inText">
                      {t('landing.tabs.multiply.tabParaLinkContent')}
                    </AppLink>
                  </>
                }
                type="multiply"
                renderProductCard={ProductCardMultiply}
              />
            ),
          },
        ]}
        narrowTabsSx={{
          display: ['block', 'none'],
          maxWidth: '343px',
          width: '100%',
        }}
        wideTabsSx={{ display: ['none', 'block'] }}
      />
      <Text variant="header2" sx={{ textAlign: 'center', mt: 7, mb: 4 }}>
        {t('landing.info-cards.have-some-questions')}
      </Text>
      <Grid
        gap={4}
        sx={{
          maxWidth: '854px',
          margin: 'auto',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        }}
      >
        <InfoCard
          title="Learn"
          subtitle="Deep dive into oasis.app functionalities and glossary"
          links={[
            {
              href: 'https://kb.oasis.app/help/getting-started',
              text: 'Get started',
            },
            {
              href: 'https://kb.oasis.app/help/tutorials',
              text: 'Tutorials',
            },
            {
              href: 'https://kb.oasis.app/help/borrow',
              text: 'Key concepts',
            },
          ]}
          backgroundGradient="linear-gradient(127.5deg, #EEE1F9 0%, #FFECE8 56.77%, #DDFFF7 100%)"
          backgroundImage="/static/img/info_cards/cubes_nov27.png"
        />
        <InfoCard
          title="Support"
          subtitle="Contact Oasis.app team whenever you need"
          links={[
            {
              href: '/support',
              text: 'FAQ',
            },
            {
              href: 'https://discord.gg/Kc2bBB59GC',
              text: 'Discord',
            },
            {
              href: '/daiwallet/contact',
              text: 'Contact us',
            },
            {
              href: 'https://twitter.com/oasisdotapp',
              text: 'Twitter',
            },
          ]}
          backgroundGradient="linear-gradient(135.35deg, #FEF7FF 0.6%, #FEE9EF 100%), radial-gradient(261.45% 254.85% at 3.41% 2.19%, #FFFADD 0%, #FFFBE3 0.01%, #F0FFF2 52.6%, #FBEDFD 100%)"
          backgroundImage="/static/img/info_cards/bubbles.png"
        />
      </Grid>
      <Text variant="header2" sx={{ textAlign: 'center', mt: 7, mb: 4 }}>
        Get started with Oasis.app
      </Text>
      <Grid
        gap={4}
        sx={{
          maxWidth: '944px',
          margin: 'auto',
          gridTemplateColumns: ['1fr', '379px 1fr'],
          gridTemplateAreas: [
            'none',
            `
            "left topRight"
            "left bottomRight"
          `,
          ],
        }}
      >
        <InfoCard
          title="Multiply your assets"
          subtitle="In a single transaction you can open a Maker vault, generate DAI, and spend them for more collateral."
          links={[
            {
              href: '/multiply',
              text: 'Open vault',
            },
          ]}
          backgroundGradient="linear-gradient(141.11deg, #EBFAFF 0.79%, #EBF2FF 98.94%), linear-gradient(127.5deg, #EEE1F9 0%, #FFECE8 56.77%, #DDFFF7 100%)"
          backgroundImage="/static/img/info_cards/pills.png"
          sx={{
            gridArea: [null, 'left'],
          }}
        />
        <InfoCard
          sx={{
            gridArea: [null, 'topRight'],
          }}
          title="Borrow Dai"
          subtitle="Choose your preferred token as collateral and open a Maker vault to get DAI"
          links={[
            {
              href: '/borrow',
              text: 'Open vault',
            },
          ]}
          backgroundGradient="linear-gradient(98.21deg, #FFFBE8 2.63%, #FFF0E8 99.63%), linear-gradient(127.5deg, #E4F9C9 0%, #E8FFF5 49.48%, #F9E1EB 100%)"
          backgroundImage="/static/img/info_cards/dai.png"
        />
        <InfoCard
          sx={{
            gridArea: [null, 'bottomRight'],
          }}
          title="Manage your vault"
          subtitle="Make actions on your vault whenever you want"
          links={[
            {
              href: '/support',
              text: 'Connect your wallet',
            },
          ]}
          backgroundGradient="linear-gradient(127.5deg, #E8EAFF 0%, #EEF0FF 0%, #FFF3FA 100%), linear-gradient(127.5deg, #DDFFF7 0%, #E8EAFF 61.98%, #F9E1EF 100%)"
          backgroundImage="/static/img/info_cards/safe.png"
        />
      </Grid>
    </Box>
  )
}

export function Hero({ sx, isConnected }: { sx?: SxStyleProp; isConnected: boolean }) {
  const { t } = useTranslation()
  const assetLpEnabled = useFeatureToggle('AssetLandingPages')

  const [heading, subheading, greyCircles] = assetLpEnabled
    ? ['landing.hero.headline', 'landing.hero.subheader', null]
    : [
        'landing.hero.headlinePreAssetLandingPages',
        'landing.hero.subheaderPreAssetLandingPages',
        <Image sx={{ mb: 4 }} src={staticFilesRuntimeUrl('/static/img/icons_set.svg')} />,
      ]
  return (
    <Flex
      sx={{
        ...sx,
        justifySelf: 'center',
        alignItems: 'center',
        textAlign: 'center',
        my: 5,
        flexDirection: 'column',
      }}
    >
      <Heading as="h1" variant="header1" sx={{ mb: 3 }}>
        {t(heading)}
      </Heading>
      <Text variant="paragraph1" sx={{ mb: 4, color: 'lavender' }}>
        <Trans i18nKey={subheading} components={[<br />]} />
      </Text>
      {greyCircles}
      {!isConnected && (
        <AppLink
          href="/connect"
          variant="primary"
          sx={{
            display: 'flex',
            margin: '0 auto',
            px: '40px',
            py: 2,
            alignItems: 'center',
            '&:hover svg': {
              transform: 'translateX(10px)',
            },
          }}
        >
          {t('connect-wallet')}
          <Icon
            name="arrow_right"
            sx={{
              ml: 2,
              position: 'relative',
              left: 2,
              transition: '0.2s',
            }}
          />
        </AppLink>
      )}
    </Flex>
  )
}
