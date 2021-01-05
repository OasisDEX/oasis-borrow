// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider'
import { getMessageKey } from 'components/connectWallet/MagicLinkView'
import { currentContent } from 'components/content'
import { OnrampKind } from 'components/dashboard/onramp/onrampForm'
import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { formatFiatBalance } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useRedirect } from 'helpers/useRedirect'
import { zero } from 'helpers/zero'
import { useTranslation } from 'i18n'
import { InferGetServerSidePropsType } from 'next'
import getConfig from 'next/config'
import { SectionDescription } from 'pages'
import { latamexFiats } from 'pages/api/latamex_quotes'
import { Dictionary } from 'ramda'
import React, { ChangeEvent, useState } from 'react'
import { TRANSITIONS } from 'theme'
import { Box, Button, Card, Flex, Grid, Heading, Image, Input, Select, Text } from 'theme-ui'

import { fetchWithTimeout } from '../helpers/fetchWithTimeout'

const {
  publicRuntimeConfig: { apiHost },
} = getConfig()

export async function getServerSideProps() {
  let quotes = null
  let spots = null
  try {
    const res = await fetchWithTimeout(`${apiHost || ''}/api/latamex_quotes`, { timeout: 10000 })
    quotes = await res.json()
  } catch (e) {
    console.log('Latamex quotes request failed', e)
  }

  try {
    const res2 = await fetch(`${apiHost || ''}/api/latam500_spots`)
    spots = await res2.json()
  } catch (e) {}

  return {
    props: { quotes, spots },
  }
}
interface Quotes {
  [currency: string]: any
}

interface Latam500ViewProps {
  quotes: Quotes
  spots: Dictionary<number>
}

function Latam500View({ quotes, spots }: Latam500ViewProps) {
  const { magicLinkConnect$ } = useAppContext()
  const { push } = useRedirect()

  const {
    t,
    i18n: { language },
  } = useTranslation()

  const [fiat, setFiat] = useState(latamexFiats[0])
  const [daiAmount, setDaiAmount] = useState<BigNumber>()
  const [fiatAmount, setFiatAmount] = useState('')
  const [minBuyAmountError, setMinBuyAmountError] = useState(false)
  const magicLinkConnect = useObservable(magicLinkConnect$)

  const Content = currentContent.latam500Tos.content[language || 'en']

  if (!magicLinkConnect) return null

  const { email, change, login, messages } = magicLinkConnect

  const price = quotes?.[`DAI${fiat}`].quote
  const minFiatAmount = quotes && new BigNumber(quotes?.[`DAI${fiat}`].toAssetMinAmount)

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    change!({ kind: 'email', email: value })
  }

  function validateAmount(amount: BigNumber | undefined) {
    return amount && minFiatAmount && amount.gte(minFiatAmount)
  }

  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/,/g, '')
    setFiatAmount(value)
    setMinBuyAmountError(!validateAmount(new BigNumber(value)))

    if (!value || !price) {
      setDaiAmount(zero)
    } else {
      const amount = new BigNumber(value).div(price)
      setDaiAmount(new BigNumber(amount.toFixed(4, 0)))
    }
  }

  function resetCalcForm() {
    setDaiAmount(undefined)
    setFiatAmount('')
    setMinBuyAmountError(false)
  }

  function handleFiatSelect(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    setFiat(value)
    resetCalcForm()
  }

  function handleMagicLinkConnect() {
    login && login()
    push(`/dashboard`)
  }

  function handleBuy() {
    if (daiAmount) {
      push(`/buy?provider=${OnrampKind.Latamex}&currency=${fiat}&amount=${daiAmount}`)
    }
  }

  const showError = messages.length > 0

  return (
    <Grid sx={{ width: '100%', justifyItems: 'center' }} gap={5}>
      <Grid
        columns={['1fr', '1fr', '518px auto']}
        gap={5}
        sx={{
          alignItems: 'center',
          maxWidth: ['518px', null, '830px'],
          mx: 'auto',
          flexDirection: ['column', 'column', 'row'],
          width: '100%',
        }}
      >
        <Grid columns="1fr" sx={{ justifyItems: ['center', 'center', 'start'] }} gap={4}>
          <Icon
            name="dai_circle_color"
            size="auto"
            height="46px"
            width="46px"
            sx={{
              position: 'relative',
              transform: 'translateX(-8%)',
            }}
          />
          <Heading
            variant="largeHeading"
            as="h1"
            sx={{
              lineHeight: 'headline',
              textAlign: ['center', 'center', 'start'],
            }}
          >
            {t('landing.hero.headline')}
          </Heading>

          <Card
            sx={{
              variant: 'gradients.latamexEmail',
              transition: TRANSITIONS.global,
              width: '100%',
              borderColor: 'transparent',
            }}
          >
            <Grid px={[2, 3, null]} py={1} gap={2} ml={-1}>
              <Heading variant="smallHeading" sx={{ color: 'surface', mb: 2 }}>
                {t('latamex-promotion-headline')}
              </Heading>
              <Text sx={{ color: 'surface', maxWidth: '414px' }}>{t('latamex-promotion')}</Text>
              <Flex
                sx={{ alignItems: 'flex-start', mt: 2, flexDirection: ['column', 'row', null] }}
              >
                <Box mr={3} sx={{ flex: 1 }}>
                  <Input
                    type="email"
                    bg="surface"
                    placeholder={t('email')}
                    onChange={handleEmailChange}
                    value={email}
                    variant={showError ? 'inputError' : 'input'}
                    sx={{
                      px: 3,
                      '&:focus+div': {
                        display: 'none',
                      },
                    }}
                  />
                  {showError ? (
                    <Text variant="error" sx={{ fontSize: 1, mt: 2 }}>
                      {messages.map((msg) => t(getMessageKey(msg)))}
                    </Text>
                  ) : null}
                </Box>
                <Button
                  disabled={!login}
                  variant="primarySquare"
                  bg="buttonEmail"
                  onClick={handleMagicLinkConnect}
                  px={4}
                  py={2}
                  sx={{
                    mt: [3, 0, null],
                    lineHeight: 'smallButton',
                    borderRadius: 'medium',
                    fontSize: 2,
                    fontWeight: 'heading',
                    '&:hover': {
                      cursor: 'pointer',
                    },
                    '&:focus': {
                      outline: 'none',
                    },
                  }}
                >
                  {t('get-started')}
                </Button>
              </Flex>
              <Text sx={{ fontSize: 2, color: 'surface', opacity: 0.7 }}>
                {t('spots-remaining', { spots: spots ? spots.spots_left : '-' })}
              </Text>
            </Grid>
          </Card>
        </Grid>
        <Image
          src="static/img/landing_phone.svg"
          sx={{
            display: ['none', 'none', 'block'],
            position: 'relative',
            maxWidth: '100%',
          }}
        />
      </Grid>
      <Flex sx={{ maxWidth: '915px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Grid
          sx={{
            justifyItems: ['center', 'center', 'start'],
            maxWidth: ['516px', '516px', '380px'],
            mt: 4,
            mr: [0, null, 4],
          }}
        >
          <Icon name="latamex_with_text" size="auto" width="154px" ml="-2%" />
          <Text sx={{ textAlign: ['center', 'center', 'start'] }}>{t('latamex-summary')}</Text>
        </Grid>
        <Grid>
          <Grid
            columns={['1fr', '192px auto auto auto', null]}
            sx={{
              alignItems: 'center',
              justifyItems: 'center',
              mt: [4, null, 5],
              ml: [0, null, 3],
            }}
          >
            <Grid
              sx={{
                gap: (theme) => [1, null, theme.sizingsCustom.gapLatam500Convert],
              }}
            >
              <Text sx={{ fontSize: '15px', fontWeight: 'semiBold' }}>
                {t('latamex-calc-spend')}
              </Text>
              <Flex
                sx={{
                  border: 'light',
                  alignItems: 'center',
                  borderRadius: 'medium',
                  boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.07)',
                  borderColor: 'borderCalculatorInput',
                  justifyContent: 'space-between',
                  textAlign: 'center',
                  overflow: 'hidden',
                }}
              >
                <Input
                  type="number"
                  onChange={handleAmountChange}
                  value={fiatAmount}
                  sx={{ fontSize: 3, border: 'none', borderRadius: 0 }}
                  bg="surface"
                />

                <Box sx={{ minWidth: '60px', m: 0, p: 0 }}>
                  <Select
                    defaultValue={fiat}
                    onChange={handleFiatSelect}
                    py={1}
                    sx={{
                      fontSize: '15px',
                      fontWeight: 'semiBold',
                      border: 'none',
                      borderRadius: 0,
                      appearance: 'none',
                    }}
                    p={0}
                    bg="surface"
                  >
                    {latamexFiats.map((fiat) => (
                      <option key={fiat}>{fiat}</option>
                    ))}
                  </Select>
                </Box>
              </Flex>
              <Text variant="small" sx={{ textAlign: ['end', 'end', 'start'], opacity: 0.7 }}>
                {t('latamex-fees-included', { fees: 2.51 })}
              </Text>
            </Grid>
            <Grid
              sx={{
                alignItems: 'center',
                maxWidth: '14px',
              }}
            >
              <Icon
                name="dai_calculator_exchange"
                sx={{ transform: ['rotate(90deg)', 'rotate(90deg)', 'rotate(0deg)'] }}
              />
            </Grid>
            <Grid
              sx={{
                alignItems: 'center',
                width: ['100%', '100%', 'auto'],
                gap: (theme) => [1, null, theme.sizingsCustom.gapLatam500Convert],
              }}
            >
              <Text sx={{ fontSize: '15px', fontWeight: 'semiBold' }}>{t('latamex-calc-buy')}</Text>
              <Flex
                px={2}
                py={2}
                variant="forms.input"
                sx={{
                  alignItems: 'center',
                  borderRadius: 'medium',
                  boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.07)',
                  border: 'light',
                  borderColor: 'borderCalculatorInput',
                }}
              >
                <Icon name="dai_circle_color" size="26px" mr={1} my={-1} />
                <Text sx={{ fontSize: '15px', overflow: 'hidden' }}>
                  {BigNumber.isBigNumber(daiAmount) && formatCryptoBalance(daiAmount!)}
                </Text>
                &nbsp;
                <Text sx={{ fontSize: '15px', fontWeight: 'semiBold', minWidth: '30px' }}>DAI</Text>
              </Flex>
              <Text variant="small" sx={{ textAlign: ['end', 'end', 'start'], opacity: 0.7 }}>
                {price ? `1 DAI = ${price} ${fiat}` : `1 DAI = ? ${fiat}`}
              </Text>
            </Grid>
            <Button
              // variant="latamexBuy"
              px="20px"
              py={0}
              onClick={handleBuy}
              disabled={!daiAmount || minBuyAmountError}
              sx={{
                fontWeight: 'heading',
                borderRadius: 'medium',
                minWidth: '93px',
                lineHeight: '42px',
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.07)',
                transition: TRANSITIONS.global,
                '&:hover': {
                  cursor: 'pointer',
                },
                '&:focus': {
                  outline: 'none',
                },
              }}
            >
              {t('buy-dai')}
            </Button>
          </Grid>
          <Grid
            sx={{
              alignItems: 'left',
              width: ['100%', '100%', 'auto'],
              ml: [0, null, 3],
            }}
          >
            {minBuyAmountError && minFiatAmount && (
              <Text variant="error" sx={{ fontSize: 3, mt: 2, pt: 1 }}>
                {t('min-amount', {
                  token: fiat,
                  minAmount: formatFiatBalance(minFiatAmount),
                })}
              </Text>
            )}
          </Grid>
        </Grid>
      </Flex>
      <Grid
        sx={{
          bg: 'background',
          borderRadius: 'roundish',
          py: 5,
          px: 3,
          mt: 4,
          width: '100%',
          justifyContent: 'center',
        }}
        gap={5}
      >
        <Heading sx={{ textAlign: 'center' }}>{t('landing.section-title')}</Heading>
        <Grid columns={[1, 1, 1, 2]} gap={4} sx={{ maxWidth: '802px', mt: 'auto' }}>
          {[...Array(4).keys()].map((i) => (
            <SectionDescription
              key={i}
              heading={t(`landing.sections.${i + 1}.title`)}
              text={t(`landing.sections.${i + 1}.description`)}
            />
          ))}
        </Grid>
      </Grid>
      <Grid sx={{ maxWidth: '915px', mt: 4 }}>
        <Text variant="heading">{t('tos')}</Text>
        <Box>
          <Content />
        </Box>
      </Grid>
    </Grid>
  )
}

export default function Latam500({
  quotes,
  spots,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!isAppContextAvailable()) return null

  return <Latam500View {...{ quotes, spots }} />
}

Latam500.layout = MarketingLayout
Latam500.layoutProps = {
  variant: 'landingContainer',
}
Latam500.theme = 'Landing'
Latam500.seoTags = (
  <PageSEOTags
    title="seo.latam500.title"
    description="seo.latam500.description"
    ogImage="og-latam500.jpg"
  />
)
