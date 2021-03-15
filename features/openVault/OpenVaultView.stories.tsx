import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { protoETHAIlkData, protoUSDCAIlkData, protoWBTCAIlkData } from 'blockchain/ilks'
import { ContextConnected, protoContextConnected } from 'blockchain/network'
import { AppContext, protoTxHelpers } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { OpenVaultView } from 'features/openVault/OpenVaultView'
import {
  protoUserETHTokenInfo,
  protoUserUSDCTokenInfo,
  protoUserWBTCTokenInfo,
  UserTokenInfo,
} from 'features/shared/userTokenInfo'
import { WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import { memoize } from 'lodash'
import React from 'react'
import { EMPTY, Observable, of } from 'rxjs'
import { Card, Container, Grid } from 'theme-ui'
import { createOpenVault$, defaultOpenVaultState, OpenVaultState } from './openVault'

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
