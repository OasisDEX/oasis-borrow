import { Icon } from 'components/Icon'
import { InfoSection } from 'components/infoSection/InfoSection'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import { MigrateToSummerIcons } from 'features/aave/components/MigrateToSummerIcons'
import { useTransactionCostWithLoading } from 'features/aave/hooks/useTransactionCostWithLoading'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { dot } from 'theme/icons'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import type { MigrateAaveStateProps } from './migrateAaveStateProps'

export function MigrateAaveFailureStateView({ state, send }: MigrateAaveStateProps) {
  const { t } = useTranslation()

  const { protocol, tokens } = state.context.strategyConfig

  const transactionCostWithLoader = useTransactionCostWithLoading({
    transactionCost: state.context.estimatedGasPrice,
  })

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('migrate.vault-form.title'),
    content: (
      <Grid gap={3}>
        <MigrateToSummerIcons fromProtocol={protocol} />
        <Box sx={{ mb: 3 }}>
          <Heading as="h3">{t('migrate.start-migrate-state.title-1')}</Heading>
          <Flex sx={{ flexDirection: 'column', mt: 2 }}>
            {[
              t('migrate.start-migrate-state.description-points-1', { asset: tokens.debt }),
              t('migrate.start-migrate-state.description-points-2'),
              t('migrate.start-migrate-state.description-points-3'),
            ].map((descriptionPoint) => (
              <Flex
                key={descriptionPoint}
                sx={{ flexDirection: 'row', alignItems: 'center', mt: 2 }}
              >
                <Box sx={{ mx: 3 }}>
                  <Icon icon={dot} size={'4px'} color="neutral80" />
                </Box>
                <Text variant="paragraph3" sx={{ display: 'block', color: 'neutral80' }}>
                  {descriptionPoint}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>
        <InfoSection
          title={''}
          items={[
            {
              label: t('migrate.estimated-transaction-cost'),
              value: transactionCostWithLoader,
            },
          ]}
        />
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: false,
      label: t('migrate.retry'),
      action: () => send({ type: 'RETRY' }),
    },
  }

  return (
    <ConnectedSidebarSection
      {...sidebarSectionProps}
      textButton={{
        label: t('open-earn.aave.vault-form.back-to-editing'),
        action: () => send('BACK_TO_EDITING'),
      }}
      context={state.context}
    />
  )
}
