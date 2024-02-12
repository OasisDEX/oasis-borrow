import { Icon } from 'components/Icon'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import { MigrateToSummerIcons } from 'features/aave/components/MigrateToSummerIcons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { dot } from 'theme/icons'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import type { MigrateAaveStateProps } from './migrateAaveStateProps'

export function MigrateStateView({ state, send, isLoading }: MigrateAaveStateProps) {
  const { t } = useTranslation()

  const { protocol, tokens } = state.context.strategyConfig

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
      </Grid>
    ),
    primaryButton: {
      isLoading: isLoading(),
      disabled: isLoading() || !state.can('NEXT_STEP'),
      label: t('migrate.start-tx'),
      action: () => send('NEXT_STEP'),
    },
    requireConnection: true,
    requiredChainHexId: state.context.strategyConfig.networkHexId,
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
