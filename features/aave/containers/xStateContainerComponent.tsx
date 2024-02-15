import { WithConnection } from 'components/connectWallet'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { aaveContext, AaveContextProvider } from 'features/aave'
import type { AaveContainerProps } from 'features/aave/containers/types'
import { AaveOpenView } from 'features/aave/open/containers/AaveOpenView'
import { getSurveyType } from 'features/aave/types'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export default function ({ definedStrategy, product }: AaveContainerProps) {
  return (
    <GasEstimationContextProvider>
      <AaveContextProvider>
        <WithConnection>
          <WithTermsOfService>
            <BackgroundLight />
            <DeferedContextProvider context={aaveContext}>
              <AaveOpenView config={definedStrategy} />
            </DeferedContextProvider>
            <Survey for={getSurveyType(product)} />
          </WithTermsOfService>
        </WithConnection>
      </AaveContextProvider>
    </GasEstimationContextProvider>
  )
}
