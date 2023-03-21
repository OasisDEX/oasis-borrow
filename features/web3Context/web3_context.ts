import { LedgerConnector } from '@oasisdex/connectors'
import { amountFromWei } from '@oasisdex/utils'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { useWeb3React } from '@web3-react/core'
import { NetworkConnector } from '@web3-react/network-connector'
import BigNumber from 'bignumber.js'
import { Provider as Web3Provider } from 'ethereum-types'
import { BridgeConnector } from 'features/web3OnBoard'
import { isEqual } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Observable, ReplaySubject } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'
import Web3 from 'web3'

import { contract, ContractDesc, getNetworkId } from './network'
import { AccountWithBalances, ConnectionKind, Web3Context } from './types'

export type BalanceOfMethod = (address: string) => { call: () => Promise<string> }
export type BalanceOfCreator = (web3: Web3, chainId: number) => BalanceOfMethod

export async function fetchAccountBalances(
  accountsLength: number,
  connector: LedgerConnector,
  daiContractDesc: ContractDesc,
): Promise<AccountWithBalances[]> {
  const provider = await connector.getProvider()
  const web3 = new Web3(provider as any)
  const accounts = await connector.getAccounts(accountsLength)

  return Promise.all(
    accounts.map(async (address: string) => {
      const etherBalance = amountFromWei(new BigNumber(await web3.eth.getBalance(address)))
      const daiBalanceOfMethod = contract(web3, daiContractDesc).methods.balanceOf
      const daiBalance = amountFromWei(new BigNumber(await daiBalanceOfMethod(address).call()))
      return {
        address: Web3.utils.toChecksumAddress(address),
        daiAmount: daiBalance,
        ethAmount: etherBalance,
      }
    }),
  )
}

export function createWeb3Context$(
  chainIdToRpcUrl: { [chainId: number]: string },
  chainIdToDaiContractDesc: { [chainId: number]: ContractDesc },
): [Observable<Web3Context>, () => void] {
  const web3Context$ = new ReplaySubject<Web3Context>(1)

  function push(c: Web3Context) {
    web3Context$.next(c)
  }

  function setupWeb3Context$() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const context = useWeb3React<Web3Provider>()

    const {
      connector,
      library,
      chainId,
      account,
      activate,
      deactivate,
      active,
      error,
      setError,
    } = context
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activatingConnector, setActivatingConnector] = useState<AbstractConnector>()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [connectionKind, setConnectionKind] = useState<ConnectionKind>()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [hwAccount, setHWAccount] = useState<string>()

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const connect = useCallback(
      async (connector: AbstractConnector, connectionKind: ConnectionKind) => {
        setActivatingConnector(connector)
        setConnectionKind(connectionKind)
        setHWAccount(undefined)

        try {
          await activate(connector)
        } catch (e) {
          console.error(`Error while connecting`, e)
          setError(new Error('Error while connecting'))
        }
      },
      [activate, setError],
    )

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const connectLedger = useCallback(
      async (chainId: number, baseDerivationPath: string) => {
        const connector = new LedgerConnector({
          baseDerivationPath,
          chainId,
          url: chainIdToRpcUrl[chainId],
          pollingInterval: 1000,
        })
        await connect(connector, 'ledger')
      },
      [connect],
    )

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (activatingConnector && activatingConnector === connector) {
        setActivatingConnector(undefined)
      }
    }, [activatingConnector, connector])

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (activatingConnector) {
        push({
          status: 'connecting',
          connectionKind: connectionKind!,
        })
        return
      }

      if (error) {
        push({
          status: 'error',
          error,
          connect,
          connectLedger,
          deactivate,
        })
        return
      }

      if (!connector) {
        push({
          status: 'notConnected',
          connect,
          connectLedger,
        })
        return
      }

      if (!account) {
        console.log('123123')
        push({
          status: 'connectedReadonly',
          connectionKind: connectionKind!,
          web3: library as any,
          chainId: chainId!,
          connect,
          connectLedger,
          deactivate,
        })
        return
      }

      if ((connectionKind === 'ledger' || connectionKind === 'trezor') && !hwAccount) {
        push({
          status: 'connectingHWSelectAccount',
          connectionKind,
          getAccounts: async (accountsLength: number) =>
            await fetchAccountBalances(
              accountsLength,
              connector as LedgerConnector,
              chainIdToDaiContractDesc[chainId!],
            ),
          selectAccount: (account: string) => {
            setHWAccount(account)
          },
          deactivate,
        })
        return
      }

      if (chainId !== getNetworkId()) {
        setTimeout(() => {
          connect(
            new NetworkConnector({
              urls: chainIdToRpcUrl,
              defaultChainId: getNetworkId(),
            }),
            'network',
            // eslint-disable-next-line @typescript-eslint/no-empty-function
          )
            .then(() => {})
            .catch((e) => {
              console.error('Error while connecting to network', e)
            })
        })
        return
      }

      if (connectionKind) {
        push({
          status: 'connected',
          connectionKind,
          web3: library as any,
          chainId: chainId!,
          account: ['ledger', 'trezor'].indexOf(connectionKind) >= 0 ? hwAccount! : account,
          deactivate,
          magicLinkEmail: undefined,
          connectionMethod: connector instanceof BridgeConnector ? 'web3-onboard' : 'legacy',
          walletLabel: connector instanceof BridgeConnector ? connector.wallet.label : undefined,
          // REFACTOR!
          // connectionKind === 'magicLink'
          //   ? (connector as MagicLinkConnector).getEmail()
          //   : undefined,
        })
      }
    }, [
      activatingConnector,
      connectionKind,
      connector,
      library,
      chainId,
      account,
      activate,
      deactivate,
      active,
      error,
      hwAccount,
      connect,
      connectLedger,
    ])
  }

  return [web3Context$.pipe(distinctUntilChanged(isEqual)), setupWeb3Context$]
}
