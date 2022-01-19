import { Icon } from '@makerdao/dai-ui-icons'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Image, SxStyleProp, Text } from 'theme-ui'

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
import { NewsletterSection } from '../newsletter/NewsletterView'

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
    <Grid
      sx={{
        flex: 1,
        position: 'relative',
      }}
    >
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
      <Box mb={5} mt={5}>
        <NewsletterSection />
      </Box>
    </Grid>
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
