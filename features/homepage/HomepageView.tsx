import { Icon } from '@makerdao/dai-ui-icons'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Heading, Image, SxStyleProp, Text } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { AppLink } from '../../components/Links'
import { useObservable } from '../../helpers/observableHook'
import { staticFilesRuntimeUrl } from '../../helpers/staticPaths'
import { useFeatureToggle } from '../../helpers/useFeatureToggle'
import { slideInAnimation } from '../../theme/animations'
import { TabSwitcher } from '../../components/TabSwitcher'

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

function BorrowTabContent() {
  return (
    <Text
      variant="paragraph2"
      sx={{ mt: 4, color: 'lavender', maxWidth: 617, textAlign: 'center' }}
    >
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut fringilla dictum nibh etc aliquam
      dolor sit amet.{' '}
      <AppLink href="/borrow" variant="inText">
        See all Borrow collateral types →
      </AppLink>
    </Text>
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
            tabLabel: 'Borrow',
            tabContent: <BorrowTabContent />,
          },
          {
            tabLabel: 'Multiply',
            tabContent: <MultiplyTabContent />,
          },
        ]}
      />
    </Grid>
  )
}

export function Hero({ sx, isConnected }: { sx?: SxStyleProp; isConnected: boolean }) {
  const { t } = useTranslation()
  const assetLpEnabled = useFeatureToggle('AssetLandingPages')

  const [heading, subheading] = assetLpEnabled
    ? ['landing.hero.headline', 'landing.hero.subheader']
    : ['landing.hero.headlinePreAssetLandingPages', 'landing.hero.subheaderPreAssetLandingPages']
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
      <Image sx={{ mb: 4 }} src={staticFilesRuntimeUrl('/static/img/icons_set.svg')} />
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
