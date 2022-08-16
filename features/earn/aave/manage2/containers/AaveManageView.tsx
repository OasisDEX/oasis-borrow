import { useTranslation } from 'next-i18next'
import React from 'react'
import { of } from 'rxjs'
import { Box, Card, Container, Grid } from 'theme-ui'

import { TabBar } from '../../../../../components/TabBar'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../../../../helpers/observableHook'
import { aaveFaq } from '../../../../content/faqs/aave'
import { Survey } from '../../../../survey'
import { SidebarManageAaveVault } from '../sidebars/SidebarManageAaveVault'
import { useAaveContext } from '../../AaveContextProvider'

export function AaveManagePositionView({ proxy }: { proxy: string }) {
  const { aaveManageStateMachine$ } = useAaveContext()
  const [stateMachine, stateMachineError] = useObservable(aaveManageStateMachine$)

  const { t } = useTranslation()
  return (
    <WithErrorHandler error={[stateMachineError]}>
      <WithLoadingIndicator value={[stateMachine]} customLoader={<VaultContainerSpinner />}>
        {([_stateMachine]) => {
          return (
            <Container variant="vaultPageContainer">
              [HEADER]
              <TabBar
                variant="underline"
                sections={[
                  {
                    value: 'overview',
                    label: t('system.overview'),
                    content: (
                      <Grid variant="vaultContainer">
                        <Box>[MANAGE AAVE DETAILS]</Box>
                        <Box>
                          {<SidebarManageAaveVault aaveManageStateMachine={_stateMachine} />}
                        </Box>
                      </Grid>
                    ),
                  },
                  {
                    value: 'faq',
                    label: t('system.faq'),
                    content: <Card variant="faq">{aaveFaq}</Card>,
                  },
                ]}
              />
              <Survey for="earn" />
            </Container>
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
