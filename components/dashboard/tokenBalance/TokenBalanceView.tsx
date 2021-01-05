// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import {
  ACTIVITY_ITEMS_INCREMENT,
  ActivityItem as ActivityItemBase,
  NoActivity,
} from 'components/Activity'
import { useAppContext } from 'components/AppContextProvider'
import { TokenConfig } from 'components/blockchain/config'
import { ViewMore } from 'components/ViewMore'
import { formatCryptoBalance, formatFiatBalance } from 'helpers/formatters/format'
import {
  WithLoadingIndicator,
  WithLoadingIndicatorWrapper,
} from 'helpers/loadingIndicator/LoadingIndicator'
import { useModal } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { useReadonlyAccount } from 'helpers/useReadonlyAccount'
import { useTranslation } from 'i18n'
import React, { useState } from 'react'
import { Box, Button, Card, Flex, Grid, Heading, Text } from 'theme-ui'

import { trackingEvents } from '../../analytics/analytics'
import { TokenReceiveView } from './TokenReceiveView'
import { TokenSendView } from './TokenSendView'

interface TokenBalanceViewProps {
  token: TokenConfig
}

interface ActivityItemProps {
  item: any
  token: TokenConfig
  isDai: boolean
}

function ActivityItem({
  token,
  item: { amount, kind, timestamp, dsrKind },
  isDai,
}: ActivityItemProps) {
  const { t } = useTranslation('common')
  const isReceived = kind === 'in'
  const label = dsrKind ? t(dsrKind) : isReceived ? t('received') : t('sent')

  return (
    <ActivityItemBase
      {...{
        timestamp,
        label,
        icon: <Icon name={isReceived ? 'arrow_down' : 'arrow_up_thin'} size="14px" />,
        componentRight: (
          <>
            {isDai && <Icon name={token.icon} size={20} sx={{ mr: 1 }} />}
            <Text>{formatCryptoBalance(amount)}</Text>
            {!isDai && <Text sx={{ ml: 1 }}>{token.symbol}</Text>}
          </>
        ),
      }}
    />
  )
}

export function TokenBalanceView({ token }: TokenBalanceViewProps) {
  const { t } = useTranslation('common')
  const { dashboard$, erc20Events$, ethTransferEventsLoading$, web3Context$ } = useAppContext()
  const { readonlyAccount } = useReadonlyAccount()
  const dashboard = useObservable(dashboard$)
  const web3Context = useObservable(web3Context$)
  // To do populate loadable history based on token! Right now it populates DAI history only
  const erc20HistoryLoadable = useObservable(erc20Events$)
  const ethHistoryLoadable = useObservable(ethTransferEventsLoading$)
  const historyLoadable = token.symbol === 'ETH' ? ethHistoryLoadable : erc20HistoryLoadable

  const openModal = useModal()

  const [itemsCount, setItemsCount] = useState(ACTIVITY_ITEMS_INCREMENT)
  function viewMore(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    setItemsCount(itemsCount + ACTIVITY_ITEMS_INCREMENT)
  }

  function send() {
    openModal(TokenSendView, { token })
    trackingEvents.tokenSend()
  }

  function receive() {
    if (web3Context && web3Context.status === 'connected') {
      openModal(TokenReceiveView, { account: web3Context.account })
      trackingEvents.tokenReceive()
    }
  }

  if (!dashboard) {
    // TODO: add loading indicator!
    return null
  }

  // @ts-ignore
  const tokenAmount = formatCryptoBalance(dashboard[token.symbol.toLowerCase()])
  // @ts-ignore
  const tokenAmountUSD = formatFiatBalance(dashboard[`${token.symbol.toLowerCase()}USD`])
  const isDai = token.symbol.toLowerCase() === 'dai'

  return (
    <Box mt={4} mx="auto" sx={{ width: '100%' }}>
      <Grid gap={4} mb={5}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={token.iconCircle} size={42} />
        </Flex>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center', my: -3 }}>
          {isDai && <Icon name={token.icon} size={55} sx={{ mr: 2 }} />}
          <Text sx={{ fontSize: 8 }}>{tokenAmount}</Text>
          {!isDai && <Text sx={{ fontSize: 8, ml: 2 }}>{token.symbol}</Text>}
        </Flex>
        <Text variant="surfaceText" sx={{ fontSize: 5, textAlign: 'center' }}>
          ${tokenAmountUSD}
        </Text>
        {!readonlyAccount && (
          <Flex sx={{ justifyContent: 'space-between', mx: 'auto' }}>
            <Button variant="primaryMedium" sx={{ mr: 2 }} onClick={send}>
              <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="send" size="14px" />
                <Text sx={{ ml: 2 }}>{t('send')}</Text>
              </Flex>
            </Button>
            <Button variant="primaryMedium" sx={{ ml: 2 }} onClick={receive}>
              <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="receive" size="14px" />
                <Text sx={{ ml: 2 }}>{t('receive')}</Text>
              </Flex>
            </Button>
          </Flex>
        )}
      </Grid>
      <Grid gap={4} columns="1fr" sx={{ width: '100%' }}>
        <Box>
          <Heading as="h2" mb={3}>
            {t('activity')}
          </Heading>
          <Card px={0} pb={historyLoadable?.status === 'loaded' ? 0 : 3}>
            <WithLoadingIndicatorWrapper sx={{ '> *': { px: 3, width: '100%' } }}>
              <WithLoadingIndicator variant="styles.spinner.large" loadable={historyLoadable}>
                {({ value: history }) => {
                  return history.length > 0 ? (
                    <>
                      {(history.slice(0, itemsCount) as any).map((item: any, idx: number) => (
                        <ActivityItem
                          {...{
                            item,
                            token,
                            isDai,
                            key: `${item.kind}${item.transactionHash}-${idx}`,
                          }}
                        />
                      ))}
                      {itemsCount < history.length && <ViewMore {...{ viewMore }} />}
                    </>
                  ) : (
                    <NoActivity />
                  )
                }}
              </WithLoadingIndicator>
            </WithLoadingIndicatorWrapper>
          </Card>
        </Box>
      </Grid>
    </Box>
  )
}
