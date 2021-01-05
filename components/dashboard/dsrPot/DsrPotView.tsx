// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import {
  ACTIVITY_ITEMS_INCREMENT,
  ActivityItem as ActivityItemBase,
  NoActivity,
} from 'components/Activity'
import { useAppContext } from 'components/AppContextProvider'
import { WAD } from 'components/constants'
import { DsrDepositView } from 'components/dashboard/dsrPot/DsrDepositView'
import { DsrWithdrawView } from 'components/dashboard/dsrPot/DsrWithdrawView'
import { ViewMore } from 'components/ViewMore'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { Loadable } from 'helpers/loadable'
import { useModal } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { roundHalfUp } from 'helpers/rounding'
import { WithReadonlyAccount } from 'helpers/types'
import { useReadonlyAccount } from 'helpers/useReadonlyAccount'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'i18n'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Box, Button, Card, Flex, Grid, Heading, Text } from 'theme-ui'

import { trackingEvents } from '../../analytics/analytics'
import { DsrEvent, DsrEventKind } from './dsrHistory'
import { DsrPot, getApyPercentage } from './dsrPot'

interface ActivityItemProps {
  item: DsrEvent
}

function DepositIcon() {
  return <Text sx={{ fontSize: '25px', lineHeight: 1, position: 'relative', top: '-1px' }}>+</Text>
}

function ActivityItem({ item: { amount, kind, timestamp } }: ActivityItemProps) {
  const { t } = useTranslation()
  const isDeposit = kind === DsrEventKind.dsrDeposit
  const label = isDeposit ? t('deposited') : t('withdrawn')

  const displayAmount = isDeposit
    ? formatCryptoBalance(amount.div(WAD))
    : formatCryptoBalance(roundHalfUp(amount.div(WAD), 'DAI'))

  return (
    <ActivityItemBase
      {...{
        timestamp,
        label,
        icon: isDeposit ? <DepositIcon /> : <Icon name={'arrow_up_thin'} size="14px" />,
        componentRight: (
          <>
            <Icon name="dai" size={20} />
            <Text sx={{ ml: 1 }}>{displayAmount}</Text>
          </>
        ),
      }}
    />
  )
}

interface DsrPotViewProps extends WithReadonlyAccount {
  loadablePot: Loadable<DsrPot>
}

export function DsrPotView({ loadablePot }: DsrPotViewProps) {
  const { dsrDeposit$ } = useAppContext()
  const dsrDeposit = useObservable(dsrDeposit$)
  const { readonlyAccount } = useReadonlyAccount()
  const { t } = useTranslation('common')
  const [itemsCount, setItemsCount] = useState(ACTIVITY_ITEMS_INCREMENT)
  const router = useRouter()
  const openModal = useModal()
  const { push } = useRedirect()

  useEffect(() => {
    const pot = loadablePot.value!
    if (pot) {
      // check if user has proxy, without history and without allowance, or if user has no proxy
      // and redirect him to DSR create flow
      const shouldRedirect =
        (!readonlyAccount &&
          pot.proxyAddress &&
          pot.history.length === 0 &&
          dsrDeposit?.daiAllowance === false) ||
        (!readonlyAccount && !pot.proxyAddress)

      if (shouldRedirect) {
        // @ts-ignore
        openModal(() => null)
        const { query } = router
        push('/[address]/pots/[pot]/create', `/${query.address}/pots/${query.pot}/create`)
      }
    }
  }, [loadablePot, dsrDeposit])

  function deposit() {
    openModal(DsrDepositView)
    trackingEvents.dsrDeposit()
  }

  function withdraw() {
    openModal(DsrWithdrawView)
    trackingEvents.dsrWithdraw()
  }

  function viewMore(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    setItemsCount(itemsCount + ACTIVITY_ITEMS_INCREMENT)
  }

  if (loadablePot.status === 'loading') {
    return <>Loading</>
  }
  if (loadablePot.status === 'error') {
    return <>Error loading</>
  }

  const pot = loadablePot.value!
  const apy = getApyPercentage(pot)

  return pot.proxyAddress ? (
    <Box mt={4} mx="auto" sx={{ width: '100%' }}>
      <Grid gap={4} mb={5}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="dai_circle_color" size={33} sx={{ mr: 1 }} />
          <Text variant="surfaceText" sx={{ fontSize: 5, textAlign: 'center', ml: 2 }}>
            {t('dai-savings-rate')}
          </Text>
        </Flex>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center', my: -3 }}>
          <Icon name="dai" size={55} />
          <Text sx={{ fontSize: 8, ml: 2 }}>
            {formatCryptoBalance(roundHalfUp(pot.dai, 'DAI'))}
          </Text>
        </Flex>
        <Text variant="surfaceText" sx={{ fontSize: 5, textAlign: 'center' }}>
          {t('earning')} {+apy.toFixed(2)}% {t('apy')}
        </Text>
        {!readonlyAccount && (
          <Flex sx={{ justifyContent: 'space-between', mx: 'auto' }}>
            <Button
              variant="primaryMedium"
              sx={{ mr: 2, minWidth: ['120px', '130px', null] }}
              onClick={deposit}
            >
              <Flex sx={{ alignItems: 'center' }}>
                <DepositIcon />
                <Text sx={{ ml: 2 }}>{t('deposit')}</Text>
              </Flex>
            </Button>
            <Button
              variant="primaryMedium"
              sx={{ ml: 2, minWidth: ['120px', '130px', null] }}
              onClick={withdraw}
            >
              <Flex sx={{ alignItems: 'center' }}>
                <Icon
                  name="arrow_up_thin"
                  size="14px"
                  color="surface"
                  sx={{ position: 'relative', top: '-1px', ml: [-1, 1, null] }}
                />
                <Text sx={{ ml: 2 }}>{t('withdraw')}</Text>
              </Flex>
            </Button>
          </Flex>
        )}
      </Grid>
      <Grid gap={4} columns="1fr" sx={{ width: '100%' }}>
        <Box>
          <Heading as="h2" mb={3}>
            {t('savings-earned')}
          </Heading>
          <Card>
            <Flex sx={{ alignItems: 'center' }}>
              <Icon name="dai" size={20} sx={{ mr: 1 }} />
              <Text sx={{ fontSize: 5 }}>{formatCryptoBalance(pot.earnings)}</Text>
            </Flex>
          </Card>
        </Box>
        <Box>
          <Heading as="h2" mb={3}>
            {t('activity')}
          </Heading>
          <Card
            px={0}
            pb={0}
            sx={{
              '> *': { px: 3 },
            }}
          >
            {pot.history.length > 0 ? (
              <>
                {pot.history.slice(0, itemsCount).map((item) => (
                  <ActivityItem item={item} key={`${item.kind}${item.block}`} />
                ))}
                {itemsCount < pot.history.length && <ViewMore {...{ viewMore }} />}
              </>
            ) : (
              <NoActivity />
            )}
          </Card>
        </Box>
      </Grid>
    </Box>
  ) : (
    <>{t('readonly-user-no-proxy')}</>
  )
}
