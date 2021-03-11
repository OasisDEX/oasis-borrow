import { contract, Web3Context } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/config'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { AppContext, TxHelpers } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { OpenVaultContainer, OpenVaultView } from 'features/openVault/OpenVaultView'
import { UserTokenInfo } from 'features/shared/userTokenInfo'
import { WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import React from 'react'
import { of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Container } from 'theme-ui'
import Web3 from 'web3'
import { createOpenVault$, OpenVaultState } from './openVault'

const now = new Date(Date.now())
const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0))

const protoWeb3Context: Web3Context = {
  chainId: 42,
  status: 'connected',
  deactivate: () => null,
  account: '0xdA1810f583320Bd25BD30130fD5Db06591bEf915',
  connectionKind: 'injected',
  web3: {} as Web3,
}

const protoContextConnected: ContextConnected = {
  contract: () => null as any,
  web3ProviderGetPastLogs: {} as Web3,
  ...networksById['42'],
  ...protoWeb3Context,
}

const protoTxHelpers: TxHelpers = {
  send: () => null as any,
  sendWithGasEstimation: () => null as any,
  estimateGas: () => null as any,
}

const protoUserTokenInfo: UserTokenInfo = {
  collateralBalance: zero,
  ethBalance: zero,
  daiBalance: zero,
  currentCollateralPrice: zero,
  currentEthPrice: zero,
  nextCollateralPrice: zero,
  nextEthPrice: zero,
  dateLastCollateralPrice: now,
  dateNextCollateralPrice: nextHour,
  dateLastEthPrice: now,
  dateNextEthPrice: now,
  isStaticCollateralPrice: false,
  isStaticEthPrice: false,
  collateralPricePercentageChange: zero,
  ethPricePercentageChange: zero,
}

const protoIlkData: IlkData = {
  maxDebtPerUnitCollateral: new BigNumber('36805.62'),
  ilkDebtAvailable: new BigNumber('76334060.2018728290793634'),
  debtFloor: new BigNumber('2000'),
  liquidationRatio: new BigNumber('1.5'),

  normalizedIlkDebt: zero,
  debtScalingFactor: zero,
  debtCeiling: zero,
  priceFeedAddress: '0x0',
  stabilityFee: zero,
  feeLastLevied: new Date('0'),
  liquidatorAddress: '0x0',
  liquidationPenalty: zero,
  maxAuctionLotSize: zero,
  token: 'ETH',
  ilk: 'ETH-A',
  ilkDebt: zero,
}

interface OpenVaultContextProviderProps extends WithChildren {
  context: ContextConnected
  proxyAddress?: string
  allowance: BigNumber
  userTokenInfo: UserTokenInfo
  ilkData: IlkData
  ilks: string[]

  newState?: Partial<OpenVaultState>
}

function OpenVaultContextProvider({
  children,
  context,
  proxyAddress,
  allowance,
  userTokenInfo,
  ilkData,
  ilks,
  newState,
}: OpenVaultContextProviderProps) {
  const context$ = of(context)
  const txHelpers$ = of(protoTxHelpers)
  const proxyAddress$ = () => of(proxyAddress)
  const allowance$ = () => of(allowance)
  const userTokenInfo$ = () => of(userTokenInfo)
  const ilkData$ = () => of(ilkData)
  const ilks$ = of(ilks)
  const ilkToToken$ = of((ilk: string) => ilk.split('-')[0])
  const openVault$ = memoize((ilk: string) =>
    createOpenVault$(
      context$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      userTokenInfo$,
      ilkData$,
      ilks$,
      ilkToToken$,
      ilk,
    ).pipe(switchMap((state) => of({ ...state, ...(newState || {}) }))),
  )

  const ctx = ({
    openVault$,
  } as any) as AppContext

  return (
    <appContext.Provider value={ctx as any}>
      <OpenVaultStoryContainer>{children}</OpenVaultStoryContainer>
    </appContext.Provider>
  )
}

const OpenVaultStoryContainer = ({ children }: WithChildren) => {
  if (!isAppContextAvailable()) return null

  return <Container variant="appContainer">{children}</Container>
}

export const EditStage = () => {
  return (
    <OpenVaultContextProvider
      context={protoContextConnected}
      userTokenInfo={protoUserTokenInfo}
      allowance={zero}
      ilks={['ETH-A']}
      ilkData={protoIlkData}
    >
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

/* export const EditStage = () =>
 *   OpenVaultStory({
 *     doc: 'New user view, zero balances of ETH and WBTC (collateral)',
 *   })
 *
 * export const EditStageWithBalances = () =>
 *   OpenVaultStory({
 *     newState: {
 *       collateralBalance: new BigNumber('100'),
 *       ethBalance: new BigNumber('1000'),
 *     },
 *     doc: 'New user view, have balances of ETH and the WBTC (collateral)',
 *   })
 *
 * export const EditStageWithDepositInput = () =>
 *   OpenVaultStory({
 *     newState: {
 *       collateralBalance: new BigNumber('100'),
 *       ethBalance: new BigNumber('1000'),
 *       depositAmount: new BigNumber('1'),
 *       maxGenerateAmount: defaultOpenVaultState.maxDebtPerUnitCollateral.times(new BigNumber('1')),
 *       warningMessages: ['noProxyAddress', 'generateAmountEmpty'],
 *     },
 *     doc: 'New user view, with deposit amount',
 *   })
 *
 * export const EditStageWithGenerateInput = () =>
 *   OpenVaultStory({
 *     newState: {
 *       collateralBalance: new BigNumber('100'),
 *       ethBalance: new BigNumber('1000'),
 *       generateAmount: new BigNumber('2000'),
 *       errorMessages: ['vaultUnderCollateralized   n ']
 *       warningMessages: ['noProxyAddress', 'depositAmountEmpty'],
 *     },
 *     doc: 'New user view, with deposit amount',
 *   })
 *  */
export default {
  title: 'OpenVault',
  component: OpenVaultContainer,
}
