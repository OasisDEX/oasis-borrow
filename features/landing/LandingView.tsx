import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink, AppLinkWithArrow } from 'components/Links'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable, useObservableWithError } from 'helpers/observableHook'
import { Trans, useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React from 'react'
import { Box, Flex, Grid, Heading, SxStyleProp, Text } from 'theme-ui'
import { fadeInAnimation, slideInAnimation } from 'theme/animations'

import { CollateralCard, LandingPageCardsPlaceholder } from './CollateralCard'
import { GetStartedSection } from './GetStarted'
import { HaveSomeQuestionsSection } from './HaveSomeQuestions'
import { HowItWorksSection } from './HowItWorks'
import { Landing } from './landing'
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
  const { landing$, context$, ilksPerToken$ } = useAppContext()
  const context = useObservable(context$)
  const ilksPerToken = useObservable(ilksPerToken$)
  const numberOfCollaterals = ilksPerToken && Object.keys(ilksPerToken).length
  const { value: landing, error: landingError } = useObservableWithError(landing$)
  const router = useRouter()

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
          mb: ['112px', '240px'],
        }}
      >
        <LandingPageCardsPlaceholder
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
              <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '410px' }}>
                <AppSpinner
                  sx={{ mt: ['145px', '315px', '145px'] }}
                  variant="styles.spinner.large"
                />
              </Flex>
            }
          >
            {(landing) => (
              <>
                <Grid
                  columns={[1, 2, 4]}
                  sx={{
                    mx: 'auto',
                    maxWidth: ['343px', '686px', 'inherit'],
                  }}
                >
                  {landing !== undefined &&
                    Object.entries(landing).map(([category, ilks]) =>
                      Object.keys(ilks).flatMap((tokenKey) => (
                        <CollateralCard
                          category={category as keyof Landing}
                          key={tokenKey}
                          title={tokenKey}
                          onClick={() => router.push(`/assets/${tokenKey}`)}
                          ilks={landing[category as keyof Landing][tokenKey]}
                          background={getToken(tokenKey).background!}
                          icon={getToken(tokenKey).bannerIconPng!}
                        />
                      )),
                    )}
                </Grid>
                {numberOfCollaterals && (
                  <Box sx={{ justifyContent: 'center', mt: 4, display: ['none', 'flex'] }}>
                    <AppLinkWithArrow href="/assets/all" sx={{ fontSize: 3 }}>
                      See all {numberOfCollaterals} collateral types
                    </AppLinkWithArrow>
                  </Box>
                )}
              </>
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
