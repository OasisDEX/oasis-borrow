import { Icon } from '@makerdao/dai-ui-icons'
import { Context } from 'blockchain/network'
import { useAppContext } from 'components/AppContextProvider'
import { PositionVM } from 'components/dumb/PositionList'
import { AppLink } from 'components/Links'
import { getAddress } from 'ethers/lib/utils'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAddress } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Heading } from 'theme-ui'

interface Props {
  address: string
}

export function ConnectWalletPrompt(props: Props) {
  const { address } = props
  const { context$, vaultsOverview$ } = useAppContext()
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const [context, contextError] = useObservable(context$)
  const [vaultsOverview, vaultsOverviewError] = useObservable(vaultsOverview$(checksumAddress))

  return (
    <WithErrorHandler error={[contextError, vaultsOverviewError]}>
      <WithLoadingIndicator value={[context, vaultsOverview]}>
        {([_context, { positions }]) => (
          <ConnectView {...props} context={_context} positions={positions} />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

interface ViewProps {
  context: Context
  address: string
  positions: PositionVM[]
}

function ConnectView({ context, address, positions }: ViewProps) {
  const { t } = useTranslation()
  const numberOfVaults = positions.length
  const connectedAccount = context?.status === 'connected' ? context.account : undefined
  const headerTranslationKey = getHeaderTranslationKey(connectedAccount, address, numberOfVaults)
  const isOwnerViewing = !!connectedAccount && address === connectedAccount

  return (
    <>
      {!isOwnerViewing && numberOfVaults === 0 && (
        <Box mt={5}>
          <Heading variant="header2" sx={{ textAlign: 'center' }} as="h1">
            <Trans
              i18nKey={headerTranslationKey}
              values={{ address: formatAddress(address) }}
              components={[<br />]}
            />
          </Heading>
        </Box>
      )}
      {context.status === 'connectedReadonly' && numberOfVaults === 0 && (
        <>
          <AppLink
            href="/connect"
            variant="primary"
            sx={{
              display: 'flex',
              margin: '0 auto',
              px: '40px',
              py: 2,
              my: 4,
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
        </>
      )}
    </>
  )
}

function getHeaderTranslationKey(
  connectedAccount: string | undefined,
  address: string,
  numberOfVaults: number,
) {
  const HEADERS_PATH = 'vaults-overview.headers'
  if (connectedAccount === undefined) {
    return numberOfVaults === 0
      ? `${HEADERS_PATH}.notConnected-noVaults`
      : `${HEADERS_PATH}.notConnected-withVaults`
  }

  if (address === connectedAccount) {
    return numberOfVaults === 0
      ? `${HEADERS_PATH}.connected-owner-noVaults`
      : `${HEADERS_PATH}.connected-owner-withVaults`
  }

  return numberOfVaults === 0
    ? `${HEADERS_PATH}.connected-viewer-noVaults`
    : `${HEADERS_PATH}.connected-viewer-withVaults`
}
