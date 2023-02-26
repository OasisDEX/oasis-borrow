import { useConnectWallet } from '@web3-onboard/react'
import { InjectedConnector } from '@web3-react/injected-connector'
import { networksById } from 'blockchain/config'
import { useAppContext } from 'components/AppContextProvider'
import { WithArrow } from 'components/WithArrow'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Button } from 'theme-ui'

export function ConnectButton() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const { t } = useTranslation()
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)

  useEffect(() => {
    if (wallet !== null) {
      console.log('wallet', wallet.icon)
      if (
        web3Context?.status === 'error' ||
        web3Context?.status === 'notConnected' ||
        web3Context?.status === 'connectedReadonly'
      ) {
        const connector = new InjectedConnector({
          supportedChainIds: Object.values(networksById).map(({ id }) => Number.parseInt(id)),
        })
        web3Context.connect(connector, 'injected')
      }
    }
  }, [wallet, web3Context])

  // create an ethers provider
  // let ethersProvider
  //
  // if (wallet) {
  //   ethersProvider = new ethers.providers.Web3Provider(wallet.provider, 'any')
  // }

  return (
    <div>
      <Button
        variant="buttons.secondary"
        sx={{
          display: 'flex',
          flexShrink: 0,
          p: 0,
          textDecoration: 'none',
          bg: 'neutral10',
          boxShadow: 'buttonMenu',
        }}
        disabled={connecting}
        onClick={() => (wallet ? disconnect(wallet) : connect())}
      >
        <WithArrow
          sx={{
            py: 2,
            pl: 4,
            pr: '40px',
            fontSize: '16px',
          }}
        >
          {t('connect-wallet-button')}
        </WithArrow>
      </Button>
    </div>
  )
}
