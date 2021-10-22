import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { useObservable } from 'helpers/observableHook'
import { Trans, useTranslation } from 'next-i18next'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Flex, Grid, Heading, Image, SxStyleProp, Text } from 'theme-ui'

const HOW_IT_WORKS_ITEMS = [
  {
    translationKey: 'connect-wallet',
  },
  { translationKey: 'deposit-assets' },
  {
    translationKey: 'generate-dai',
    components: [
      <AppLink
        href="https://kb.oasis.app/help/why-open-a-vault"
        sx={{ fontWeight: 'normal', fontSize: 'inherit' }}
      />,
    ],
  },
  {
    translationKey: 'manage-vault',
    components: [
      <AppLink
        href="https://kb.oasis.app/help/how-to-assess-vault-s-risk"
        sx={{ fontWeight: 'normal', fontSize: 'inherit' }}
      />,
    ],
  },
]

function HowItWorksItemDescription({
  isActive,
  itemNumber,
  onClick,
  translationKey,
  components,
}: {
  isActive: boolean
  itemNumber: number
  onClick?: (itemNumber: number) => void
} & typeof HOW_IT_WORKS_ITEMS[number]) {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        minHeight: '32px',
        color: 'text.subtitle',
      }}
    >
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          mr: 3,
          transition: '0.3s ease-in-out',
          fontWeight: 'semiBold',
          bg: '#EDEDFF',
          position: 'relative',
          cursor: onClick ? 'pointer' : 'default',
          ...(isActive && {
            color: 'text.contrast',
          }),
          '&:before': {
            display: 'block',
            content: '""',
            position: 'absolute',
            zIndex: 1,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            borderRadius: 'inherit',
            transition: 'inherit',
            opacity: 0,
            background: 'linear-gradient(137.02deg, #2A30EE 0%, #A4A6FF 99.12%)',
            ...(isActive && {
              opacity: 1,
            }),
          },
        }}
        onClick={onClick ? () => onClick(itemNumber) : undefined}
      >
        <Text sx={{ position: 'relative', zIndex: 1 }}>{itemNumber + 1}</Text>
      </Flex>
      <Box sx={{ flex: 1, ml: 2, mt: 1 }}>
        <Text
          sx={{
            transition: '0.3s ease-in-out',
            mb: 2,
            cursor: onClick ? 'pointer' : 'default',
            ...(isActive && {
              fontWeight: 'semiBold',
              color: 'primary',
            }),
          }}
          onClick={onClick ? () => onClick(itemNumber) : undefined}
        >
          {t(`landing.how-it-works.items.${translationKey}.title`)}
        </Text>
        {isActive && (
          <Box sx={{ color: 'primary', maxWidth: '24em' }}>
            <Trans
              i18nKey={`landing.how-it-works.items.${translationKey}.description`}
              components={components || []}
            />
          </Box>
        )}
      </Box>
    </Flex>
  )
}

function ButtonConnectWallet({ sx }: { sx?: SxStyleProp }) {
  const { context$ } = useAppContext()
  const context = useObservable(context$)
  const { t } = useTranslation()

  return context?.status === 'connected' ? null : (
    <Box sx={sx}>
      <AppLink href="/connect">
        <Button sx={{ fontWeight: 'semiBold', px: 4, width: ['100%', 'auto'] }}>
          <Flex sx={{ alignItems: 'center', justifyContent: ['center', 'flex-start'] }}>
            <Text>{t('connect-wallet-button')}</Text>
            <Icon sx={{ ml: 1 }} name="arrow_right" />
          </Flex>
        </Button>
      </AppLink>
    </Box>
  )
}

export function HowItWorksSection() {
  const [scrolled, setScrolled] = useState(false)
  const [scrolledPercentage, setScrolledPercentage] = useState<number>()
  const cardsRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  function handleScroll() {
    const cards = cardsRef.current

    if (cards) {
      const cardsHeight = cards.clientHeight
      const cardsOffsetTop = cards.getBoundingClientRect().top

      if (!scrolled && cardsOffsetTop < 0) {
        setScrolled(true)
      } else if (scrolled && cardsOffsetTop > 0) {
        setScrolled(false)
      }

      if (cardsOffsetTop < 220 && cardsOffsetTop * -1 < cardsHeight) {
        const percentage = ((cardsHeight + cardsOffsetTop - 220) / cardsHeight) * 100
        setScrolledPercentage(percentage)
      }
    }
  }

  function handleScrollTo(itemNumber: number) {
    const howItWorksItem = document.getElementById(`how-it-works-${itemNumber}`)

    if (howItWorksItem) {
      const top = howItWorksItem.offsetTop - 32

      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const activeStep = Math.min(
    scrolledPercentage ? HOW_IT_WORKS_ITEMS.length - Math.floor(scrolledPercentage / 25) : 1,
    HOW_IT_WORKS_ITEMS.length,
  )

  return (
    <Box py={6}>
      <Grid
        columns={[1, 2, 'minmax(275px, 1fr) minmax(1fr, 576px)']}
        sx={{ alignItems: 'flex-start' }}
        gap={[3, null, 5]}
      >
        <Grid
          sx={{
            pt: 5,
            ...(scrolled && {
              position: ['relative', 'sticky'],
              top: 0,
              width: 'inherit',
            }),
          }}
        >
          <Heading as="h2" variant="header2" sx={{ textAlign: ['center', 'left'] }}>
            {t('landing.how-it-works.title')}
          </Heading>
          <Box sx={{ display: ['none', 'flex'], alignItems: 'center', mt: 4 }}>
            <Grid gap={3}>
              {HOW_IT_WORKS_ITEMS.map(({ translationKey, components }, i) => (
                <HowItWorksItemDescription
                  key={i}
                  {...{
                    isActive: i + 1 === activeStep,
                    itemNumber: i,
                    translationKey,
                    components,
                    onClick: handleScrollTo,
                  }}
                />
              ))}
            </Grid>
          </Box>
          <ButtonConnectWallet sx={{ display: ['none', 'block'], mt: 3 }} />
        </Grid>
        <Grid gap={[5, 6]} ref={cardsRef} pt={5} sx={{ flex: 1 }}>
          {HOW_IT_WORKS_ITEMS.map(({ translationKey, components }, i) => (
            <Box
              id={`how-it-works-${i}`}
              key={i}
              sx={{
                overflow: 'hidden',
                opacity: 1,
                transition: '0.5s ease-in-out',
                ...(i + 1 < activeStep && {
                  opacity: [1, 0],
                }),
              }}
            >
              <Box
                sx={{
                  height: ['auto', 0],
                  pb: ['0px', '68.8%'],
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: ['relative', 'absolute'],
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image sx={{ maxHeight: '100%' }} src={`/static/img/how_it_works_${i + 1}.png`} />
                </Box>
              </Box>
              <Box sx={{ display: ['block', 'none'], maxWidth: '476px', mx: 'auto', py: 4 }}>
                <HowItWorksItemDescription
                  {...{ isActive: true, itemNumber: i, translationKey, components }}
                />
              </Box>
            </Box>
          ))}
          <ButtonConnectWallet
            sx={{
              display: ['block', 'none'],
              mt: 0,
              maxWidth: '476px',
              width: '100%',
              mx: 'auto',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
