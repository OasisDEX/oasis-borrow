import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { OptimizationDetailsControl } from 'features/automation/optimization/controls/OptimizationDetailsControl'
import { OptimizationFormControl } from 'features/automation/optimization/controls/OptimizationFormControl'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React, { useMemo } from 'react'

import { DefaultVaultLayout } from './DefaultVaultLayout'

interface OptimizationControlProps {
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
}

export function OptimizationControl({ vault, ilkData, balanceInfo }: OptimizationControlProps) {
  const {
    automationTriggersData$,
    priceInfo$,
    context$,
    txHelpers$,
    tokenPriceUSD$,
    userSettings$,
  } = useAppContext()
  const priceInfoObs$ = useMemo(() => priceInfo$(vault.token), [vault.token])
  const [priceInfoData, priceInfoError] = useObservable(priceInfoObs$)
  const [txHelpersData, txHelpersError] = useObservable(txHelpers$)
  const [contextData, contextError] = useObservable(context$)
  const autoTriggersData$ = automationTriggersData$(vault.id)
  const [automationTriggersData, automationTriggersError] = useObservable(autoTriggersData$)
  const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$(['ETH', vault.token]), [vault.token])
  const [ethAndTokenPricesData, ethAndTokenPricesError] = useObservable(_tokenPriceUSD$)
  const [userSettingsData, userSettingsError] = useObservable(userSettings$)
  console.log('userSettingsData')
  console.log(userSettingsData)
  console.log('userSettingsData?.slippage.toFixed(3)')
  console.log(userSettingsData?.slippage.toFixed(3))

  return (
    <WithErrorHandler error={[automationTriggersError, priceInfoError, ethAndTokenPricesError, contextError, txHelpersError, userSettingsError]}>
      <WithLoadingIndicator
        value={[automationTriggersData, priceInfoData, contextData, ethAndTokenPricesData, userSettingsData]}
        customLoader={<VaultContainerSpinner />}
      >
        {([automationTriggers, priceInfo, context, ethAndTokenPrices, userSettings]) => (
          <DefaultVaultLayout
            detailsViewControl={
              <OptimizationDetailsControl
                vault={vault}
                automationTriggersData={automationTriggers}
                priceInfo={priceInfo}
              />
            }
            editForm={
              <OptimizationFormControl
                vault={vault}
                automationTriggersData={automationTriggers}
                ilkData={ilkData}
                priceInfo={priceInfo}
                txHelpers={txHelpersData}
                context={context}
                balanceInfo={balanceInfo}
                ethMarketPrice={ethAndTokenPrices['ETH']}
                slippageLimit={userSettings.slippage}
              />
            }
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
