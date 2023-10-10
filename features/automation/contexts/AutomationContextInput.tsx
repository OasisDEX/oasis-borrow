import type { AutomationCommonData, AutomationPositionData } from 'components/context'
import { AutomationContextProvider, useMainContext, useProductContext } from 'components/context'
import type {
  AutomationDefinitionMetadata,
  OverwriteTriggersDefaults,
} from 'features/automation/metadata/types'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import type { VaultProtocol } from 'helpers/getVaultProtocol'
import { useObservable } from 'helpers/observableHook'
import type { PropsWithChildren } from 'react'
import React, { useMemo } from 'react'

interface GeneralManageControlProps {
  positionData: AutomationPositionData
  commonData: AutomationCommonData
  protocol: VaultProtocol
  metadata: AutomationDefinitionMetadata
  overwriteTriggersDefaults?: OverwriteTriggersDefaults
}

export function AutomationContextInput({
  children,
  positionData,
  commonData,
  protocol,
  metadata,
  overwriteTriggersDefaults,
}: PropsWithChildren<GeneralManageControlProps>) {
  const { context$ } = useMainContext()
  const { tokenPriceUSD$, balanceInfo$ } = useProductContext()
  const [contextData, contextError] = useObservable(context$)

  const resolvedAccount =
    contextData?.status === 'connected' && contextData.account ? contextData.account : ''

  const _balanceInfo = useMemo(
    () => balanceInfo$(positionData.token, resolvedAccount),
    [positionData.token, resolvedAccount],
  )
  const [balanceInfoData, balanceInfoError] = useObservable(_balanceInfo)

  const _tokenPriceUSD$ = useMemo(
    () => tokenPriceUSD$(['ETH', positionData.token]),
    [positionData.token],
  )
  const [ethAndTokenPricesData, ethAndTokenPricesError] = useObservable(_tokenPriceUSD$)

  return (
    <WithErrorHandler error={[ethAndTokenPricesError, balanceInfoError, contextError]}>
      <WithLoadingIndicator
        value={[ethAndTokenPricesData, balanceInfoData, contextData]}
        customLoader={<VaultContainerSpinner />}
      >
        {([ethAndTokenPrices, balanceInfo, context]) => (
          <AutomationContextProvider
            context={context}
            ethAndTokenPricesData={ethAndTokenPrices}
            ethBalance={balanceInfo.ethBalance}
            positionData={positionData}
            commonData={commonData}
            protocol={protocol}
            metadata={metadata}
            overwriteTriggersDefaults={overwriteTriggersDefaults}
          >
            {children}
          </AutomationContextProvider>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
