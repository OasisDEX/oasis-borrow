// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { CardProduct } from 'components/Cards'
import { getApyPercentage } from 'components/dashboard/dsrPot/dsrPot'
import { AppLink } from 'components/Links'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { WithLoadingIndicator } from 'helpers/loadingIndicator/LoadingIndicator'
import { useObservable } from 'helpers/observableHook'
import { useReadonlyAccount } from 'helpers/useReadonlyAccount'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'i18n'
import { useRouter } from 'next/router'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Badge, Box, Button, Flex, Grid, Heading, Text } from 'theme-ui'

function DSRApy({
  setWithWarning,
}: {
  setWithWarning: Dispatch<SetStateAction<boolean | undefined>>
}) {
  const { t } = useTranslation('common')
  const { dashboard$ } = useAppContext()
  const dashboard = useObservable(dashboard$)

  return (
    <Box>
      <Badge variant="primary">
        <Flex sx={{ alignItems: 'center' }}>
          <WithLoadingIndicator variant="styles.spinner.default" loadable={dashboard?.pots.dsr}>
            {({ value: pot }) => {
              const apy = getApyPercentage(pot)
              useEffect(() => {
                setWithWarning(apy.isZero())
              }, [pot])

              return <>{+apy.toFixed(2)} </>
            }}
          </WithLoadingIndicator>
          <Text>% {t('apy')}</Text>
        </Flex>
      </Badge>
    </Box>
  )
}

function ComingSoonApy({ protocol }: { protocol: string }) {
  const { t } = useTranslation('common')
  const { dashboard$ } = useAppContext()
  const dashboard = useObservable(dashboard$)

  if (!dashboard) return null
  return (
    <Box>
      <Badge variant="primary" sx={{ border: '1px solid', borderColor: 'muted' }}>
        <Flex sx={{ alignItems: 'center' }}>
          <>{dashboard?.apy[protocol].toFixed(2)} </>

          <Text>% {t('apy')}</Text>
        </Flex>
      </Badge>
    </Box>
  )
}

function DSRCard() {
  const { t } = useTranslation('common')
  const [withWarning, setWithWarning] = useState<boolean | undefined>(undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const { push } = useRedirect()
  const { query } = useRouter()

  function openDSR() {
    if (!withWarning) {
      push('/[address]/pots/[pot]/create', `/${query.address}/pots/dsr/create`)
    } else {
      setModalOpen(true)
    }
  }

  return (
    <>
      <Box onClick={withWarning !== undefined ? openDSR : undefined}>
        <CardProduct
          {...{
            icon: <Icon name="maker_circle_color" size={45} />,
            title: t('dai-savings-rate'),
            description: t('dsr-product'),
            bottomComponent: <DSRApy {...{ setWithWarning }} />,
          }}
        />
      </Box>
      {modalOpen && (
        <Modal>
          <ModalCloseIcon
            close={() => {
              console.log('close')
              setModalOpen(false)
            }}
          />
          <Box p={3}>
            <Box px={2}>
              <Heading sx={{ textAlign: 'center' }} mt={4}>
                {t('dai-savings-rate')}
              </Heading>
              <Text mt={3} mb={4}>
                {t('dsr-warning-message')}
              </Text>
            </Box>
            <Button
              variant="primarySquare"
              onClick={() => setModalOpen(false)}
              sx={{ width: '100%', mb: 3 }}
            >
              {t('dsr-warning-setup')}
            </Button>
            <AppLink href="/pots/[pot]/create" as="/pots/dsr/create">
              <Button variant="outlineSquareBig" sx={{ width: '100%' }}>
                {t('dsr-warning-continue')}
              </Button>
            </AppLink>
          </Box>
        </Modal>
      )}
    </>
  )
}

export default function CreatePotPage() {
  const { t } = useTranslation('common')
  useReadonlyAccount(true)

  return (
    <Grid gap={4} sx={{ width: '100%' }}>
      <Heading as="h1" variant="mediumHeading" sx={{ textAlign: 'center' }}>
        {t('select-product')}
      </Heading>
      <DSRCard />
      <CardProduct
        {...{
          icon: <Icon name="compound_circle_color" size={45} />,
          title: t('compound'),
          description: t('compound-product'),
          bottomComponent: <ComingSoonApy protocol="compound" />,
          isComingSoon: true,
        }}
      />
      <CardProduct
        {...{
          icon: <Icon name="aave_circle_color" size={45} />,
          title: t('aave'),
          description: t('aave-product'),
          bottomComponent: <ComingSoonApy protocol="aave" />,
          isComingSoon: true,
        }}
      />
    </Grid>
  )
}

CreatePotPage.layoutProps = {
  backLink: {
    href: '/dashboard',
  },
}
