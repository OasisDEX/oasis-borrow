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
import React from 'react'
import { of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'
import Web3 from 'web3'
import { createOpenVault$, IlkValidationState, OpenVaultState } from './openVault'

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

const protoUserETHTokenInfo: UserTokenInfo = {
  collateralBalance: zero,
  ethBalance: zero,
  daiBalance: zero,

  currentEthPrice: new BigNumber('1780.7'),
  nextEthPrice: new BigNumber('1798.6'),
  dateLastCollateralPrice: now,
  dateNextCollateralPrice: nextHour,
  dateLastEthPrice: now,
  dateNextEthPrice: nextHour,
  isStaticEthPrice: false,
  ethPricePercentageChange: new BigNumber('0.99004781496719670855'),

  currentCollateralPrice: new BigNumber('1780.7'),
  nextCollateralPrice: new BigNumber('1798.6'),
  isStaticCollateralPrice: false,
  collateralPricePercentageChange: new BigNumber('0.99004781496719670855'),
}

const protoETHAIlkData: IlkData = {
  debtCeiling: new BigNumber('1482351717.8074963620138921299'),
  debtFloor: new BigNumber('2000'),
  debtScalingFactor: new BigNumber('1.03252304318189770482'),
  feeLastLevied: now,
  ilk: 'ETH-A',
  ilkDebt: new BigNumber('1417402362.052916865548128154'),
  ilkDebtAvailable: new BigNumber('64949355.754579496465763975'),
  liquidationPenalty: new BigNumber('0.13'),
  liquidationRatio: new BigNumber('1.5'),
  liquidatorAddress: '0xF32836B9E1f47a0515c6Ec431592D5EbC276407f',
  maxAuctionLotSize: new BigNumber('50000'),
  maxDebtPerUnitCollateral: new BigNumber('1187.13333333333333333333'),
  normalizedIlkDebt: new BigNumber('1372756154.366247564502420602'),
  priceFeedAddress: '0x81FE72B5A8d1A857d176C3E7d5Bd2679A9B85763',
  stabilityFee: new BigNumber(
    '0.054999999999991559213658976792039293404550595107713042286458478527410020941495574539245120619341733',
  ),
  token: 'ETH',
}

const protoUserWBTCTokenInfo: UserTokenInfo = {
  collateralBalance: zero,
  ethBalance: zero,
  daiBalance: zero,

  currentEthPrice: new BigNumber('1780.7'),
  nextEthPrice: new BigNumber('1798.6'),
  dateLastCollateralPrice: now,
  dateNextCollateralPrice: nextHour,
  dateLastEthPrice: now,
  dateNextEthPrice: nextHour,
  isStaticEthPrice: false,
  ethPricePercentageChange: new BigNumber('0.99004781496719670855'),

  currentCollateralPrice: new BigNumber('56176.76'),
  isStaticCollateralPrice: false,
  nextCollateralPrice: new BigNumber('56762.258'),
  collateralPricePercentageChange: new BigNumber('0.98968508264769875786'),
}

const protoWBTCAIlkData: IlkData = {
  debtCeiling: new BigNumber('282897479.11236999035644766557'),
  debtFloor: new BigNumber('2000'),
  debtScalingFactor: new BigNumber('1.02360932507235653375'),
  feeLastLevied: now,
  ilk: 'WBTC-A',
  ilkDebt: new BigNumber('269203682.978267290292807367'),
  ilkDebtAvailable: new BigNumber('13693796.134102700063640297'),
  liquidationPenalty: new BigNumber('0.13'),
  liquidationRatio: new BigNumber('1.5'),
  liquidatorAddress: '0x58CD24ac7322890382eE45A3E4F903a5B22Ee930',
  maxAuctionLotSize: new BigNumber('50000'),
  maxDebtPerUnitCollateral: new BigNumber('37451.17333333333333333333'),
  normalizedIlkDebt: new BigNumber('262994558.943899730116777436'),
  priceFeedAddress: '0xf185d0682d50819263941e5f4EacC763CC5C6C42',
  stabilityFee: new BigNumber(
    '0.044999999999894654754833429952693264878294382475669356753434716561425711705437754164710051744608456',
  ),
  token: 'WBTC',
}

const protoUserUSDCTokenInfo: UserTokenInfo = {
  collateralBalance: zero,
  ethBalance: zero,
  daiBalance: zero,

  currentEthPrice: new BigNumber('1780.7'),
  nextEthPrice: new BigNumber('1798.6'),
  dateLastCollateralPrice: now,
  dateNextCollateralPrice: nextHour,
  dateLastEthPrice: now,
  dateNextEthPrice: nextHour,
  isStaticEthPrice: false,
  ethPricePercentageChange: new BigNumber('0.99004781496719670855'),

  currentCollateralPrice: new BigNumber('56176.76'),
  isStaticCollateralPrice: true,
}

const protoUSDCAIlkData: IlkData = {
  debtCeiling: new BigNumber('0'),
  debtFloor: new BigNumber('2000'),
  debtScalingFactor: new BigNumber('1.03102744355779205622'),
  feeLastLevied: now,
  ilk: 'USDC-A',
  ilkDebt: new BigNumber('331518098.058419701965172664'),
  ilkDebtAvailable: new BigNumber('0'),
  liquidationPenalty: new BigNumber('0.13'),
  liquidationRatio: new BigNumber('1.01'),
  liquidatorAddress: '0xbe359e53038E41a1ffA47DAE39645756C80e557a',
  maxAuctionLotSize: new BigNumber('50000'),
  maxDebtPerUnitCollateral: new BigNumber('0.99009900990099009901'),
  normalizedIlkDebt: new BigNumber('321541487.697400130582559103'),
  priceFeedAddress: '0x77b68899b99b686F415d074278a9a16b336085A0',
  stabilityFee: new BigNumber('0.05'),
  token: 'USDC',
}

interface OpenVaultContextProviderProps extends WithChildren {
  title?: string
  context?: ContextConnected
  proxyAddress?: string
  allowance?: BigNumber
  newState?: Partial<OpenVaultState | IlkValidationState>
}

function OpenVaultContextProvider({
  title,
  children,
  context,
  proxyAddress,
  allowance,
  newState,
}: OpenVaultContextProviderProps) {
  const context$ = of(context ? context : protoContextConnected)
  const txHelpers$ = of(protoTxHelpers)
  const proxyAddress$ = () => of(proxyAddress)
  const allowance$ = () => of(allowance ? allowance : zero)
  const userTokenInfo$ = (token: string) =>
    of(
      token === 'ETH'
        ? protoUserETHTokenInfo
        : token === 'WBTC'
        ? protoUserWBTCTokenInfo
        : protoUserUSDCTokenInfo,
    )
  const ilkData$ = (ilk: string) =>
    of(
      ilk === 'ETH-A' ? protoETHAIlkData : ilk === 'WBTC-A' ? protoWBTCAIlkData : protoUSDCAIlkData,
    )
  const ilkToToken$ = of((ilk: string) => ilk.split('-')[0])
  const ilks$ = of(['ETH-A', 'WBTC-A', 'USDC-A'])
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
      <OpenVaultStoryContainer title={title}>{children}</OpenVaultStoryContainer>
    </appContext.Provider>
  )
}

const OpenVaultStoryContainer = ({ children, title }: WithChildren & { title?: string }) => {
  if (!isAppContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}

        {children}
      </Grid>
    </Container>
  )
}

export const IlkValidationLoadingStage = () => {
  return (
    <OpenVaultContextProvider
      title={'Validating ilk exists'}
      newState={{
        isIlkValidationStage: true,
        isEditingStage: false,
        stage: 'ilkValidationLoading',
      }}
    >
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const IlkValidationFailureStage = () => {
  return (
    <OpenVaultContextProvider title={'Ilk retrieved does not exist'}>
      <OpenVaultView ilk={'ETH-Z'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStageETH = () => {
  return (
    <OpenVaultContextProvider title={'Editing stage: user has no collateral balance'}>
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStageWBTC = () => {
  return (
    <OpenVaultContextProvider title={'Editing stage: user has no collateral balance'}>
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

/*
 * export const EditStage = () => {
 *   return (
 *     <OpenVaultContextProvider
 *       context={protoContextConnected}
 *       userTokenInfo={protoUserETHTokenInfo}
 *       allowance={zero}
 *       ilks={['ETH-A']}
 *       ilkData={protoETHAIlkData}
 *     >
 *       <OpenVaultView ilk={'ETH-A'} />
 *     </OpenVaultContextProvider>
 *   )
 * }
 *  */
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
