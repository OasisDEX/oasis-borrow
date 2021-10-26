import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable, useObservableWithError } from 'helpers/observableHook'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, SxStyleProp, Text } from 'theme-ui'
import { fadeInAnimation, slideInAnimation } from 'theme/animations'

import { CollateralCard } from './CollateralCard'
import { FeaturedIlksPlaceholder } from './FeaturedIlks'
import { GetStartedSection } from './GetStarted'
import { HaveSomeQuestionsSection } from './HaveSomeQuestions'
import { HowItWorksSection } from './HowItWorks'
import { TypeformWidget } from './TypeformWidget'

export function Hero({ sx, isConnected }: { sx?: SxStyleProp; isConnected: boolean }) {
  const { t } = useTranslation()

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
        {t('landing.hero.headline')}
      </Heading>
      <Text variant="paragraph1" sx={{ mb: 4, color: 'lavender' }}>
        <Trans i18nKey="landing.hero.subheader" components={[<br />]} />
      </Text>
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

export function LandingView() {
  const { landing$, context$ } = useAppContext()
  const context = useObservable(context$)
  const { value: landing, error: landingError } = useObservableWithError(landing$)

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
      <Box
        sx={{
          ...slideInAnimation,
          position: 'relative',
          my: 4,
          mb: [2, 3, 5],
        }}
      >
        <FeaturedIlksPlaceholder
          sx={
            landing !== undefined
              ? {
                  ...fadeInAnimation,
                  animationDirection: 'backwards',
                  animationFillMode: 'backwards',
                }
              : {}
          }
        />
        <WithErrorHandler error={landingError}>
          <WithLoadingIndicator
            value={landing}
            customLoader={
              <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
                <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
              </Flex>
            }
          >
            {(landing) => (
              <Grid columns={[1, 4]} sx={{ mx: 'auto', maxWidth: ['288px', 'inherit'] }}>
                {landing !== undefined &&
                  Object.keys(landing).map((tokenKey) => (
                    <CollateralCard
                      key={tokenKey}
                      title={tokenKey}
                      onClick={() => null}
                      ilks={landing[tokenKey]}
                      background={getToken(tokenKey).background!}
                      icon={getToken(tokenKey).bannerIconPng!}
                    />
                  ))}
              </Grid>
            )}
          </WithLoadingIndicator>
        </WithErrorHandler>
      </Box>
      <HowItWorksSection />
      <HaveSomeQuestionsSection />
      <GetStartedSection />
      <TypeformWidget />
    </Grid>
  )
}
