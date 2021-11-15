import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { useAppContext } from 'components/AppContextProvider'
import { ManageVaultContainer } from 'features/manageVault/ManageVaultView'
import { MultiplyEvent } from 'features/vaultHistory/vaultHistoryEvents'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import _ from 'lodash'
import React, { ReactNode } from 'react'
import { Container } from 'theme-ui'

import { DefaultManageMultiplyVaultContainer } from '../openMultiplyVault/variants/default/manage/DefaultManageMultiplyVaultContainer'
import { GuniManageMultiplyVaultCointainer } from '../openMultiplyVault/variants/guni/manage/GuniManageMultiplyVaultCointainer'
import { VaultType } from './generalManageVault'

export function GeneralManageVaultView({ id }: { id: BigNumber }) {
  const { generalManageVault$, vaultHistory$, vaultMultiplyHistory$ } = useAppContext()
  const manageVaultWithId$ = generalManageVault$(id)
  const manageVaultWithError = useObservableWithError(manageVaultWithId$)
  const vaultHistoryWithError = useObservableWithError(vaultHistory$(id))
  const vaultMultiplyHistoryWithError = useObservableWithError(vaultMultiplyHistory$(id))

  function prepareMultiplyHistory(vaultHistory: any[], vaultMultiplyHistory: any[]) {
    let outstandingDebt = new BigNumber(0)
    let collateral = new BigNumber(0)

    const multiplyEventsTxs = [...vaultMultiplyHistory].map((e: any) => e.hash)
    const nonMultiplyEvents = _.cloneDeep(vaultHistory).filter(
      (e: any) => !multiplyEventsTxs.includes(e.hash),
    )

    const vaultFullHistory = [...vaultMultiplyHistory, ...nonMultiplyEvents].sort(
      (a: any, b: any) => {
        if (a.blockId < b.blockId) return 1
        if (a.blockId > b.blockId) return -1
        return 0
      },
    )

    for (const mpEvent of vaultFullHistory.reverse()) {
      let currentRate = zero
      if ((mpEvent as MultiplyEvent).flDue) {
        const flFee = (mpEvent as MultiplyEvent).flDue.minus(mpEvent.flBorrowed)
        mpEvent.fees = amountFromWei(flFee.plus(mpEvent.oazoFee), 'DAI')
      }

      for (const event of vaultHistory.filter(
        (e: any) => e.blockId === mpEvent.blockId && e.txId === mpEvent.txId,
      )) {
        const oraclePrice =
          event.oraclePrice && event.oraclePrice.gt(zero) ? event.oraclePrice : zero
        if (mpEvent.kind === 'openMultiplyVault' || mpEvent.kind === 'increaseMultiple') {
          if (event.kind === 'OPEN') {
            event.isHidden = true
          }
          if (event.kind === 'DEPOSIT') {
            currentRate = event.rate
            collateral = collateral.plus(event.collateralAmount)
            mpEvent.collateralAmount = event.collateralAmount
            mpEvent.collateralTotal = collateral
            mpEvent.oraclePrice = oraclePrice
            event.isHidden = true
          }
          if (event.kind === 'GENERATE') {
            currentRate = event.rate
            const debt = event.daiAmount.div(event.rate)
            outstandingDebt = outstandingDebt.plus(debt)
            mpEvent.daiAmount = event.daiAmount
            mpEvent.oraclePrice = oraclePrice
            event.isHidden = true
          }
        }
        if (
          mpEvent.kind === 'decreaseMultiple' ||
          mpEvent.kind === 'closeVaultExitDai' ||
          mpEvent.kind === 'closeVaultExitCollateral'
        ) {
          if (event.kind === 'WITHDRAW') {
            currentRate = event.rate
            collateral = collateral.plus(event.collateralAmount)
            mpEvent.collateralAmount = event.collateralAmount
            mpEvent.collateralTotal = collateral
            mpEvent.oraclePrice = oraclePrice
            event.isHidden = true
          }
          if (event.kind === 'PAYBACK') {
            currentRate = event.rate
            const debt = event.daiAmount.div(event.rate)
            outstandingDebt = outstandingDebt.plus(debt)
            mpEvent.daiAmount = event.daiAmount
            mpEvent.oraclePrice = oraclePrice
            event.isHidden = true
          }
        }

        if (mpEvent.kind === 'OPEN' && event.kind === 'OPEN') {
          event.isHidden = true
        }

        if (mpEvent.kind === 'GENERATE' && event.kind === 'GENERATE') {
          currentRate = event.rate
          const debt = event.daiAmount.div(event.rate)
          outstandingDebt = outstandingDebt.plus(debt)
          mpEvent.daiAmount = event.daiAmount
          mpEvent.oraclePrice = oraclePrice
          event.isHidden = true
        }
        if (mpEvent.kind === 'DEPOSIT' && event.kind === 'DEPOSIT') {
          currentRate = event.rate
          collateral = collateral.plus(event.collateralAmount)
          mpEvent.collateralAmount = event.collateralAmount
          mpEvent.collateralTotal = collateral
          mpEvent.oraclePrice = oraclePrice
          event.isHidden = true
        }

        if (mpEvent.kind === 'WITHDRAW' && event.kind === 'WITHDRAW') {
          currentRate = event.rate
          collateral = collateral.plus(event.collateralAmount)
          mpEvent.collateralAmount = event.collateralAmount
          mpEvent.collateralTotal = collateral
          mpEvent.oraclePrice = oraclePrice
          event.isHidden = true
        }

        if (mpEvent.kind === 'PAYBACK' && event.kind === 'PAYBACK') {
          currentRate = event.rate
          const debt = event.daiAmount.div(event.rate)
          outstandingDebt = outstandingDebt.plus(debt)
          mpEvent.daiAmount = event.daiAmount
          mpEvent.oraclePrice = oraclePrice
          event.isHidden = true
        }
      }

      const multiple = collateral
        .times(mpEvent.oraclePrice)
        .div(collateral.times(mpEvent.oraclePrice).minus(outstandingDebt.times(currentRate)))

      const liquidationPrice = collateral.eq(zero)
        ? zero
        : outstandingDebt.times(currentRate).times(mpEvent.liquidationRatio).div(collateral)
      const netValueUSD = collateral.times(mpEvent.oraclePrice).minus(outstandingDebt)

      const debt = outstandingDebt.times(currentRate)
      mpEvent.collateral = collateral
      mpEvent.outstandingDebt = debt.gt(0.01) ? debt : zero
      mpEvent.multiple = multiple
      mpEvent.liquidationPrice = liquidationPrice
      mpEvent.netValueUSD = netValueUSD
    }

    return [...vaultHistory, ...[...vaultFullHistory].reverse()]
  }

  return (
    <WithErrorHandler
      error={[
        manageVaultWithError.error,
        vaultHistoryWithError.error,
        vaultMultiplyHistoryWithError.error,
      ]}
    >
      <WithLoadingIndicator
        value={[
          manageVaultWithError.value,
          vaultHistoryWithError.value,
          vaultMultiplyHistoryWithError.value,
        ]}
        customLoader={<VaultContainerSpinner />}
      >
        {([generalManageVault, vaultHistory, vaultMultiplyHistory]) => {
          switch (generalManageVault.type) {
            case VaultType.Borrow:
              return (
                <Container variant="vaultPageContainer">
                  <ManageVaultContainer
                    vaultHistory={vaultHistory}
                    manageVault={generalManageVault.state}
                  />
                </Container>
              )
            case VaultType.Multiply:
              const multiplyHistory = prepareMultiplyHistory(
                _.cloneDeep(vaultHistory),
                _.cloneDeep(vaultMultiplyHistory),
              )
              const vaultIlk = generalManageVault.state.ilkData.ilk
              const multiplyContainerMap: Record<string, ReactNode> = {
                // TODO just for testing, remove before release
                'ETH-A': (
                  <GuniManageMultiplyVaultCointainer
                    vaultHistory={multiplyHistory}
                    manageVault={generalManageVault.state}
                  />
                ),
                'GUNIV3DAIUSDC1-A': (
                  <GuniManageMultiplyVaultCointainer
                    vaultHistory={multiplyHistory}
                    manageVault={generalManageVault.state}
                  />
                ),
              }
              return (
                <Container variant="vaultPageContainer">
                  {multiplyContainerMap[vaultIlk] ? (
                    multiplyContainerMap[vaultIlk]
                  ) : (
                    <DefaultManageMultiplyVaultContainer
                      vaultHistory={multiplyHistory}
                      manageVault={generalManageVault.state}
                    />
                  )}
                </Container>
              )
          }
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
