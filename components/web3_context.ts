import { amountFromWei } from '@oasisdex/utils';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import { NetworkConnector } from '@web3-react/network-connector';
import BigNumber from 'bignumber.js';
import { Provider as Web3Provider } from 'ethereum-types';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import Web3 from 'web3';
import { LedgerConnector } from '@oasisdex/connectors';
import { contract, ContractDesc, getNetworkId } from './network';
import { AccountWithBalances, ConnectionKind, Web3Context } from './types';

export type BalanceOfMethod = (address: string) => { call: () => Promise<string> };
export type BalanceOfCreator = (web3: Web3, chainId: number) => BalanceOfMethod;

export async function fetchAccountBalances(
  accountsLength: number,
  connector: LedgerConnector,
  daiContractDesc: ContractDesc,
): Promise<AccountWithBalances[]> {
  const provider = await connector.getProvider();
  const web3 = new Web3(provider as any);
  const accounts = await connector.getAccounts(accountsLength);

  return Promise.all(
    accounts.map(async (address: string) => {
      const etherBalance = amountFromWei(new BigNumber(await web3.eth.getBalance(address)));
      const daiBalanceOfMethod = contract(web3, daiContractDesc).methods.balanceOf;
      const daiBalance = amountFromWei(new BigNumber(await daiBalanceOfMethod(address).call()));
      return {
        address: Web3.utils.toChecksumAddress(address),
        daiAmount: daiBalance,
        ethAmount: etherBalance,
      };
    }),
  );
}

export function createWeb3Context$(
  chainIdToRpcUrl: { [chainId: number]: string },
  chainIdToDaiContractDesc: { [chainId: number]: ContractDesc },
): [Observable<Web3Context>, () => void] {
  const web3Context$ = new ReplaySubject<Web3Context>(1);

  function push(c: Web3Context) {
    web3Context$.next(c);
  }

  function setupWeb3Context$() {
    const context = useWeb3React<Web3Provider>();

    const { connector, library, chainId, account, activate, deactivate, active, error } = context;
    const [activatingConnector, setActivatingConnector] = useState<AbstractConnector>();
    const [connectionKind, setConnectionKind] = useState<ConnectionKind>();
    const [hwAccount, setHWAccount] = useState<string>();

    async function connect(connector: AbstractConnector, connectionKind: ConnectionKind) {
      if(active) {
        deactivate()
      }
      setActivatingConnector(connector);
      setConnectionKind(connectionKind);
      setHWAccount(undefined);
      await activate(connector);
    }

    async function connectLedger(chainId: number, baseDerivationPath: string) {
      const connector = new LedgerConnector({
        baseDerivationPath,
        chainId,
        url: chainIdToRpcUrl[chainId],
        pollingInterval: 1000,
      });
      await connect(connector, 'ledger');
    }

    useEffect(() => {
      if (activatingConnector && activatingConnector === connector) {
        setActivatingConnector(undefined);
      }
    }, [activatingConnector, connector]);

    useEffect(() => {
      if (activatingConnector) {
        push({
          status: 'connecting',
          connectionKind: connectionKind!,
        });
        return;
      }

      if (error) {
        console.log(error);
        push({
          status: 'error',
          error,
          connect,
          connectLedger,
          deactivate,
        });
        return;
      }

      if (!connector) {
        push({
          status: 'notConnected',
          connect,
          connectLedger,
        });
        return;
      }

      if (!account) {
        push({
          status: 'connectedReadonly',
          connectionKind: connectionKind!,
          web3: library as any,
          chainId: chainId!,
          connect,
          connectLedger,
          deactivate,
        });
        return;
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
            setHWAccount(account);
          },
          deactivate,
        });
        return;
      }

      if (chainId !== getNetworkId()) {
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          connect(
            new NetworkConnector({
              urls: chainIdToRpcUrl,
              defaultChainId: getNetworkId(),
            }),
            'network',
          );
        });
        return;
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
          // REFACTOR!
          // connectionKind === 'magicLink'
          //   ? (connector as MagicLinkConnector).getEmail()
          //   : undefined,
        });
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
    ]);
  }

  return [web3Context$.pipe(distinctUntilChanged(isEqual)), setupWeb3Context$];
}
