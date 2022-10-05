import { useActor } from '@xstate/react'
import React from 'react'
import { Box } from 'theme-ui'

import { DetailsSection } from '../../../../../components/DetailsSection'
import { formatCryptoBalance } from '../../../../../helpers/formatters/format'
import { zero } from '../../../../../helpers/zero'
import { useManageAaveStateMachineContext } from '../containers/AaveManageStateMachineContext'

export function AaveOverviewSectionComponent() {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)

  return (
    <DetailsSection
      title={'Overview'}
      content={
        <>
          <Box>
            {'Proxy: '} {state.context.proxyAddress}{' '}
          </Box>
          <Box>
            {'Position Details: '}{' '}
            {formatCryptoBalance(state.context.positionData?.currentATokenBalance || zero)}
            {' stETH'}
          </Box>
          <Box>
            {'Current State: '} {state.value.toString()}
          </Box>
        </>
      }
      footer={<></>}
    />
  )
}
