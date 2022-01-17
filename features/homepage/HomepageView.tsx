import { Icon } from '@makerdao/dai-ui-icons'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Heading, Image, SxStyleProp, Text } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { AppLink } from '../../components/Links'
import { TabSwitcher } from '../../components/TabSwitcher'
import { useObservable, useObservableWithError } from '../../helpers/observableHook'
import { staticFilesRuntimeUrl } from '../../helpers/staticPaths'
import { useFeatureToggle } from '../../helpers/useFeatureToggle'
import { slideInAnimation } from '../../theme/animations'
import { AppSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { landingPageCardsData } from '../../helpers/productCards'
import { BorrowProductCard } from '../../components/ProductCardBorrow'

function MultiplyTabContent() {
  return (
    <Text
      variant="paragraph2"
      sx={{ mt: 4, color: 'lavender', maxWidth: 617, textAlign: 'center' }}
    >
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut fringilla dictum nibh etc aliquam
      dolor sit amet.{' '}
      <AppLink href="/multiply" variant="inText">
        See all Multiply collateral types →
      </AppLink>
    </Text>
  )
}

function ProductCardsLayout(props: { productCards: Array<JSX.Element> }) {
  return (
    <Grid
      sx={{
        gap: '17px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(378px, max-content))',
        width: '100%',
        boxSizing: 'border-box',
        justifyContent: 'center',
      }}
    >
      {props.productCards}
    </Grid>
  )
}

function BorrowTabContent() {
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut fringilla dictum nibh etc
              aliquam dolor sit amet.{' '}
              <AppLink href="/borrow" variant="inText">
                See all Borrow collateral types →
              </AppLink>
            </Text>
            <ProductCardsLayout
              productCards={landingPageCardsData({
                productCardsData,
                product: 'borrow',
              }).map((cardData) => (
                <BorrowProductCard cardData={cardData} />
              ))}
            />
          </>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

export function HomepageView() {
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
            tabLabel: 'Borrow on Oasis',
            tabContent: <BorrowTabContent />,
          },
          {
            tabLabel: 'Multiply on Oasis',
            tabContent: <MultiplyTabContent />,
          },
        ]}
        narrowTabsSx={{
          display: ['block', 'none'],
          maxWidth: '343px',
          width: '100%',
        }}
        wideTabsSx={{ display: ['none', 'block'] }}
      />
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
