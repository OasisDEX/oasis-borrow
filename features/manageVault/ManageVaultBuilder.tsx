import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { buildIlkData$, BuildIlkDataProps, IlkData } from 'blockchain/ilks'
import { Context, protoContext } from 'blockchain/network'
import { buildVault$, BuildVaultProps, Vault } from 'blockchain/vaults'
import { AppContext, protoTxHelpers } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { BalanceInfo, buildBalanceInfo$, BuildBalanceInfoProps } from 'features/shared/balanceInfo'
import { buildPriceInfo$, BuildPriceInfoProps, PriceInfo } from 'features/shared/priceInfo'
import { one } from 'helpers/zero'
import React from 'react'
import { useEffect } from 'react'
import { Observable, of } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

import { createManageVault$, ManageVaultState } from './manageVault'
import { ManageVaultView } from './ManageVaultView'

const VAULT_ID = one

interface BuildManageVaultProps {
  _context$?: Observable<Context>
  _ilkData$?: Observable<IlkData>
  _priceInfo$?: Observable<PriceInfo>
  _balanceInfo$?: Observable<BalanceInfo>
  _proxyAddress$?: Observable<string | undefined>
  _collateralAllowance$?: Observable<BigNumber>
  _daiAllowance$?: Observable<BigNumber>
  _vault$?: Observable<Vault>

  ilkData?: BuildIlkDataProps
  priceInfo?: BuildPriceInfoProps
  balanceInfo?: BuildBalanceInfoProps
  vault: BuildVaultProps

  proxyAddress?: string
  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber
  account?: string
  status?: 'connected'
}

function buildManageVault$({
  _ilkData$,
  _priceInfo$,
  _balanceInfo$,
  _proxyAddress$,
  _collateralAllowance$,
  _daiAllowance$,
  _vault$,
  ilkData,
  priceInfo,
  balanceInfo = {},
  vault,
  proxyAddress,
  collateralAllowance = maxUint256,
  daiAllowance = maxUint256,
  account = '0xVaultController',
  status = 'connected',
}: BuildManageVaultProps): Observable<ManageVaultState> {
  const token = vault.ilk.split('-')[0]

  const context$ = of({
    ...protoContext,
    account,
    status,
  })
  const txHelpers$ = of(protoTxHelpers)

  const priceInfo$ = () => _priceInfo$ || buildPriceInfo$({ ...priceInfo, token })
  const ilkData$ = () =>
    _ilkData$ ||
    buildIlkData$({
      _priceInfo$: priceInfo$(),
      ...ilkData,
    })

  const balanceInfo$ = () =>
    _balanceInfo$ || buildBalanceInfo$({ ...balanceInfo, address: account })

  const proxyAddress$ = () => _proxyAddress$ || of(proxyAddress)
  const allowance$ = (_token: string) =>
    _token === 'DAI'
      ? _daiAllowance$ || of(daiAllowance)
      : _collateralAllowance$ || of(collateralAllowance)

  const _oraclePriceData$ = priceInfo$().pipe(
    switchMap(({ currentCollateralPrice, nextCollateralPrice, isStaticCollateralPrice }) =>
      of({
        currentPrice: currentCollateralPrice,
        nextPrice: nextCollateralPrice || currentCollateralPrice,
        isStaticPrice: isStaticCollateralPrice,
      }),
    ),
  )

  const vault$ = () =>
    _vault$ ||
    buildVault$({
      _oraclePriceData$,
      _ilkData$: ilkData$(),
      ilk: vault.ilk,
      collateral: vault.collateral,
      debt: vault.debt,
    })
  return createManageVault$(
    context$ as Observable<Context>,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    vault$,
    VAULT_ID,
  )
}

type SharedManageVaultState = Partial<
  Omit<ManageVaultState, Extract<keyof ManageVaultState, keyof BuildManageVaultProps>>
>
type ManageVaultStory = { title?: string } & BuildManageVaultProps & SharedManageVaultState

export function manageVaultStory({
  title,
  account,
  balanceInfo,
  priceInfo,
  vault,
  ilkData,
  depositAmount,
  withdrawAmount,
  generateAmount,
  paybackAmount,
  proxyAddress,
  stage = 'collateralEditing',
  ...otherState
}: ManageVaultStory) {
  return () => {
    const obs$ = buildManageVault$({
      account,
      balanceInfo,
      priceInfo,
      vault,
      ilkData,
      proxyAddress,
    })

    useEffect(() => {
      const subscription = obs$
        .pipe(first())
        .subscribe(({ injectStateOverride, priceInfo: { currentCollateralPrice } }) => {
          const newState: Partial<ManageVaultState> = {
            ...otherState,
            stage,
            ...(depositAmount && {
              depositAmount,
              depositAmountUSD: depositAmount.times(currentCollateralPrice),
            }),
            ...(withdrawAmount && {
              withdrawAmount,
              withdrawAmountUSD: withdrawAmount.times(currentCollateralPrice),
            }),
            ...(generateAmount && {
              generateAmount,
            }),
            ...(paybackAmount && {
              paybackAmount,
            }),
          }

          injectStateOverride(newState || {})
        })
      return subscription.unsubscribe()
    }, [])

    const ctx = ({
      manageVault$: () => obs$,
    } as any) as AppContext

    return (
      <appContext.Provider value={ctx as any}>
        <ManageVaultStoryContainer title={title} />
      </appContext.Provider>
    )
  }
}

const ManageVaultStoryContainer = ({ title }: { title?: string }) => {
  if (!isAppContextAvailable()) return null
  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}
        <ManageVaultView id={VAULT_ID} />
      </Grid>
    </Container>
  )
}
