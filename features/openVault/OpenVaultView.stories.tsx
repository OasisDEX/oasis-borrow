import { Web3Context } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { networksById } from 'blockchain/config'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { AppContext, TxHelpers } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { OpenVaultView } from 'features/openVault/OpenVaultView'
import { UserTokenInfo } from 'features/shared/userTokenInfo'
import { WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import { memoize } from 'lodash'
import React from 'react'
import { EMPTY, Observable, of } from 'rxjs'
import { Card, Container, Grid } from 'theme-ui'
import Web3 from 'web3'
import { createOpenVault$, defaultOpenVaultState, OpenVaultState } from './openVault'

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
  ilks$?: Observable<string[]>
  userTokenInfo?: Partial<UserTokenInfo>
  newState?: Partial<OpenVaultState>
}

function OpenVaultContextProvider({
  title,
  children,
  context,
  proxyAddress,
  allowance,
  ilks$,
  userTokenInfo,
  newState,
}: OpenVaultContextProviderProps) {
  const defaultState$ = of({ ...defaultOpenVaultState, ...(newState || {}) })
  const context$ = of(context ? context : protoContextConnected)
  const txHelpers$ = of(protoTxHelpers)
  const proxyAddress$ = () => of(proxyAddress)
  const allowance$ = () => of(allowance ? allowance : maxUint256)
  const userTokenInfo$ = (token: string) =>
    of({
      ...(token === 'ETH'
        ? protoUserETHTokenInfo
        : token === 'WBTC'
        ? protoUserWBTCTokenInfo
        : protoUserUSDCTokenInfo),
      ...(userTokenInfo || {}),
    })
  const ilkData$ = (ilk: string) =>
    of(
      ilk === 'ETH-A' ? protoETHAIlkData : ilk === 'WBTC-A' ? protoWBTCAIlkData : protoUSDCAIlkData,
    )
  const ilkToToken$ = of((ilk: string) => ilk.split('-')[0])
  const openVault$ = memoize((ilk: string) =>
    createOpenVault$(
      defaultState$,
      context$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      userTokenInfo$,
      ilkData$,
      ilks$ || of(['ETH-A', 'WBTC-A', 'USDC-A']),
      ilkToToken$,
      ilk,
    ),
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
    <OpenVaultContextProvider {...{ ilks$: EMPTY }}>
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const IlkValidationFailureStage = () => {
  return (
    <OpenVaultContextProvider>
      <OpenVaultView ilk={'ETH-Z'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStage = () => {
  return (
    <OpenVaultContextProvider
      {...{
        proxyAddress: '0xProxyAddress',
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: { depositAmount: new BigNumber('5'), generateAmount: new BigNumber('2500') },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStageWarningGenerateAmountEmpty = () => {
  return (
    <OpenVaultContextProvider
      {...{
        proxyAddress: '0xProxyAddress',
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: { depositAmount: new BigNumber('5') },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStageWarningDepositAndGenerateAmountEmpty = () => {
  return (
    <OpenVaultContextProvider
      {...{
        proxyAddress: '0xProxyAddress',
        userTokenInfo: { collateralBalance: new BigNumber('100') },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStageNoProxyAddress = () => {
  return (
    <OpenVaultContextProvider
      {...{
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: { depositAmount: new BigNumber('5'), generateAmount: new BigNumber('2500') },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStageNoAllowance = () => {
  return (
    <OpenVaultContextProvider
      {...{
        proxyAddress: '0xProxyAddress',
        allowance: zero,
        userTokenInfo: { collateralBalance: new BigNumber('100') },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStageNoProxyAndNoAllowance = () => {
  return (
    <OpenVaultContextProvider
      {...{
        allowance: zero,
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: { depositAmount: new BigNumber('5'), generateAmount: new BigNumber('2500') },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStageAllowanceLessThanDepositAmount = () => {
  return (
    <OpenVaultContextProvider
      {...{
        proxyAddress: '0xProxyAddress',
        allowance: new BigNumber('4'),
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: { depositAmount: new BigNumber('5'), generateAmount: new BigNumber('2500') },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStagePotentialGenerateAmountLessThanDebtFloor = () => {
  return (
    <OpenVaultContextProvider
      {...{
        proxyAddress: '0xProxyAddress',
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: { depositAmount: new BigNumber('0.001') },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStageDepositAmountGreaterThanMaxDepositAmount = () => {
  return (
    <OpenVaultContextProvider
      {...{
        proxyAddress: '0xProxyAddress',
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: { depositAmount: new BigNumber('101'), generateAmount: new BigNumber('2000') },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStageGenerateAmountLessThanDebtFloor = () => {
  return (
    <OpenVaultContextProvider
      {...{
        proxyAddress: '0xProxyAddress',
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: { depositAmount: new BigNumber('5'), generateAmount: new BigNumber('1999') },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStageGenerateAmountGreaterThanDebtCeiling = () => {
  return (
    <OpenVaultContextProvider
      {...{
        proxyAddress: '0xProxyAddress',
        userTokenInfo: { collateralBalance: new BigNumber('1000000000000') },
        newState: {
          depositAmount: new BigNumber('10000000000'),
          generateAmount: new BigNumber('100000000'),
        },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const EditingStageVaultUnderCollateralized = () => {
  return (
    <OpenVaultContextProvider
      {...{
        proxyAddress: '0xProxyAddress',
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: {
          depositAmount: new BigNumber('0.11'),
          generateAmount: new BigNumber('5000'),
        },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const ProxyWaitingForConfirmation = () => {
  return (
    <OpenVaultContextProvider newState={{ stage: 'proxyWaitingForConfirmation' }}>
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const ProxyWaitingForApproval = () => {
  return (
    <OpenVaultContextProvider newState={{ stage: 'proxyWaitingForApproval' }}>
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const ProxyFailure = () => {
  return (
    <OpenVaultContextProvider newState={{ stage: 'proxyFailure' }}>
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const ProxyInProgress = () => {
  return (
    <OpenVaultContextProvider
      newState={{
        stage: 'proxyInProgress',
        proxyConfirmations: 2,
      }}
    >
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const ProxySuccess = () => {
  return (
    <OpenVaultContextProvider newState={{ stage: 'proxySuccess' }}>
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const AllowanceWaitingForConfirmation = () => {
  return (
    <OpenVaultContextProvider
      {...{
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: {
          stage: 'allowanceWaitingForConfirmation',
          depositAmount: new BigNumber('10'),
          generateAmount: new BigNumber('5000'),
        },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const AllowanceWaitingForApproval = () => {
  return (
    <OpenVaultContextProvider
      {...{
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: {
          stage: 'allowanceWaitingForApproval',
          depositAmount: new BigNumber('10'),
          generateAmount: new BigNumber('5000'),
        },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const AllowanceFailure = () => {
  return (
    <OpenVaultContextProvider
      {...{
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: {
          stage: 'allowanceFailure',
          depositAmount: new BigNumber('10'),
          generateAmount: new BigNumber('5000'),
        },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const AllowanceInProgress = () => {
  return (
    <OpenVaultContextProvider newState={{ stage: 'allowanceInProgress' }}>
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const AllowanceSuccess = () => {
  return (
    <OpenVaultContextProvider
      {...{
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: {
          stage: 'allowanceSuccess',
          depositAmount: new BigNumber('10'),
          generateAmount: new BigNumber('5000'),
        },
      }}
    >
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const OpenWaitingForConfirmation = () => {
  return (
    <OpenVaultContextProvider
      {...{
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: {
          stage: 'openWaitingForConfirmation',
          depositAmount: new BigNumber('10'),
          generateAmount: new BigNumber('5000'),
        },
      }}
    >
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const OpenWaitingForApproval = () => {
  return (
    <OpenVaultContextProvider
      {...{
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: {
          stage: 'openWaitingForApproval',
          depositAmount: new BigNumber('10'),
          generateAmount: new BigNumber('5000'),
        },
      }}
    >
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const OpenFailure = () => {
  return (
    <OpenVaultContextProvider
      {...{
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: {
          stage: 'openFailure',
          depositAmount: new BigNumber('10'),
          generateAmount: new BigNumber('5000'),
        },
      }}
    >
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const OpenInProgress = () => {
  return (
    <OpenVaultContextProvider
      {...{
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: {
          stage: 'openInProgress',
          depositAmount: new BigNumber('10'),
          generateAmount: new BigNumber('5000'),
        },
      }}
    >
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const OpenSuccess = () => {
  return (
    <OpenVaultContextProvider
      {...{
        userTokenInfo: { collateralBalance: new BigNumber('100') },
        newState: {
          stage: 'openSuccess',
          id: 122345,
          depositAmount: new BigNumber('10'),
          generateAmount: new BigNumber('5000'),
        },
      }}
    >
      <OpenVaultView ilk={'ETH-A'} />
    </OpenVaultContextProvider>
  )
}

export const PriceFeedOSM = () => {
  return (
    <OpenVaultContextProvider>
      <OpenVaultView ilk={'WBTC-A'} />
    </OpenVaultContextProvider>
  )
}

export const PriceFeedDSValue = () => {
  return (
    <OpenVaultContextProvider>
      <OpenVaultView ilk={'USDC-A'} />
    </OpenVaultContextProvider>
  )
}

export default {
  title: 'OpenVault',
  component: OpenVaultView,
}
