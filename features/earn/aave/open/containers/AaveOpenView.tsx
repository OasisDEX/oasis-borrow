import { TabBar } from 'components/TabBar'
import { aaveFaq } from 'features/content/faqs/aave'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

import { useObservable } from '../../../../../helpers/observableHook'
import { useAaveContext } from '../../AaveContextProvider'
import { SidebarOpenAaveVault } from '../sidebars/SidebarOpenAaveVault'

export function AaveOpenView() {
  const { aaveStateMachine$ } = useAaveContext()
  const [stateMachine, stateMachineError] = useObservable(aaveStateMachine$)

  const { t } = useTranslation()

  return (
    <WithErrorHandler error={[stateMachineError]}>
      <WithLoadingIndicator value={[stateMachine]} customLoader={<VaultContainerSpinner />}>
        {([_stateMachine]) => (
          <Container variant="vaultPageContainer">
            [HEADER]
            <TabBar
              variant="underline"
              sections={[
                {
                  value: 'simulate',
                  label: t('open-vault.simulate'),
                  content: (
                    <Grid variant="vaultContainer">
                      <Box>[OPEN AAVE DETAILS]</Box>
                      <Box>{<SidebarOpenAaveVault aaveStateMachine={_stateMachine} />}</Box>
                    </Grid>
                  ),
                },
                {
                  value: 'position-info',
                  label: t('system.position-info'),
                  content: <Card variant="faq">{aaveFaq}</Card>,
                },
              ]}
            />
            <Survey for="earn" />
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
