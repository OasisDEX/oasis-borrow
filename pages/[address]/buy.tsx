// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { CardProduct } from 'components/Cards'
import { OnrampKind } from 'components/dashboard/onramp/onrampForm'
import { OnrampFormView } from 'components/dashboard/onramp/OnrampFormView'
import { POSITIVE_REALS } from 'helpers/constants'
import arFlagSvg from 'helpers/icons/ar-flag.svg'
import brFlagSvg from 'helpers/icons/br-flag.svg'
import mxFlagSvg from 'helpers/icons/mx-flag.svg'
import { useModal } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { useReadonlyAccount } from 'helpers/useReadonlyAccount'
import { useTranslation } from 'i18n'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { latamexFiats } from 'pages/api/latamex_quotes'
import React, { useEffect } from 'react'
import { Badge, Flex, Grid, Heading, Image } from 'theme-ui'

import { trackingEvents } from '../../components/analytics/analytics'

const {
  publicRuntimeConfig: { latamexEnabled },
} = getConfig()

const ONRAMPS: OnrampKind[] = [OnrampKind.Wyre, OnrampKind.MoonPay]

if (latamexEnabled) {
  ONRAMPS.unshift(OnrampKind.Latamex)
}

function BadgeFlag({ flag }: { flag: any }) {
  return (
    <Badge
      variant="onramp"
      sx={{
        mr: 2,
        maxWidth: '45px',
        width: '100%',
        p: 1,
        fontSize: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:last-child': {
          mr: 0,
        },
      }}
    >
      <Image src={flag} />
    </Badge>
  )
}

function OnrampProviderCard({ onramp }: { onramp: OnrampKind; onClick: () => void }) {
  const { t } = useTranslation('common')
  const provider = onramp.toLowerCase()
  const openModal = useModal()

  function openOnramp(onramp: OnrampKind) {
    openModal((props) => <OnrampFormView {...{ ...props, onramp }} />)
  }

  return (
    <CardProduct
      {...{
        // Still need icon for Latamex in .svg from David
        icon: <Icon name={provider} size="auto" width="35" height="35" />,
        title: onramp,
        description: t(`${provider}-desc`),
        onClick: () => openOnramp(onramp),
        bottomComponent: (
          <>
            <Flex
              sx={{
                alignItems: ['flex-start', 'center', 'center'],
                flexDirection: ['column', 'row', 'row'],
              }}
            >
              <Badge variant="onramp" sx={{ mr: 2, width: 'fit-content', mb: [3, 0, 0] }}>
                {t(`${provider}-badge-fees`)}
              </Badge>
              {onramp === OnrampKind.Latamex ? (
                <Flex sx={{ flex: 1, width: '100%' }}>
                  <BadgeFlag flag={arFlagSvg} />
                  <BadgeFlag flag={brFlagSvg} />
                  <BadgeFlag flag={mxFlagSvg} />
                </Flex>
              ) : (
                <Badge variant="onramp" sx={{ mr: 2, width: 'fit-content' }}>
                  {t(`${provider}-badge-country`)}
                </Badge>
              )}
            </Flex>
          </>
        ),
      }}
    />
  )
}

function OnrampContainer() {
  const { query } = useRouter()
  const { termsAcceptance$, web3Context$ } = useAppContext()
  const termsAcceptance = useObservable(termsAcceptance$)
  const web3Context = useObservable(web3Context$)

  const openModal = useModal()

  useEffect(() => {
    if (
      web3Context?.status === 'connected' &&
      termsAcceptance?.stage === 'acceptanceAccepted' &&
      query.provider === OnrampKind.Latamex &&
      latamexFiats.some((f) => f === query.currency) &&
      POSITIVE_REALS.test(query?.amount as string)
    ) {
      openModal((props) => (
        <OnrampFormView
          {...{
            ...props,
            onramp: query.provider,
            hasQueryDefaults: true,
            defaultAmount: new BigNumber(query.amount as string),
            defaultQuoteCurrency: query.currency,
            defaultEmail:
              web3Context?.connectionKind === 'magicLink' ? web3Context.magicLinkEmail : null,
          }}
        />
      ))
    }
  }, [termsAcceptance, web3Context?.status])

  return (
    <>
      {ONRAMPS.map((onramp) => (
        <OnrampProviderCard
          {...{ onramp, key: onramp }}
          onClick={() => {
            trackingEvents.chooseOnrampProvider(onramp)
          }}
        />
      ))}
    </>
  )
}

export default function BuyPage() {
  const { t } = useTranslation('common')
  useReadonlyAccount(true)

  return (
    <Grid gap={4} sx={{ width: '100%' }}>
      <Heading as="h1" sx={{ textAlign: 'center', fontSize: 6 }}>
        {t('choose-provider')}
      </Heading>
      <OnrampContainer />
    </Grid>
  )
}

BuyPage.layoutProps = {
  backLink: {
    href: '/dashboard',
  },
}
