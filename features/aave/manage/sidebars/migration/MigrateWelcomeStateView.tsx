import BigNumber from 'bignumber.js'
import { Icon } from 'components/Icon'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import { FeesInformation } from 'features/aave/components/order-information/FeesInformation'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { tick } from 'theme/icons'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import type { MigrateAaveStateProps } from './migrateAaveStateProps'

export function MigrateWelcomeStateView({ state, send, isLoading }: MigrateAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('migrate.vault-form.title'),
    content: (
      <Grid gap={3}>
        <Box sx={{ textAlign: 'center', m: 3 }}>
          <Heading as="h3">{t('migrate.welcome-state.title-1')}</Heading>
          <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('migrate.welcome-state.description-1')}
          </Text>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Heading as="h3">{t('migrate.welcome-state.title-2')}</Heading>
          {[
            'migrate.welcome-state.description-points-1',
            'migrate.welcome-state.description-points-2',
            'migrate.welcome-state.description-points-3',
            'migrate.welcome-state.description-points-4',
          ].map((tickDescription) => (
            <Flex
              key={`${tickDescription}-asd`}
              sx={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Icon icon={tick} size={16} sx={{ m: 3 }} />
              <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
                <Trans
                  i18nKey={tickDescription}
                  components={{ strong: <Text sx={{ fontWeight: 'semiBold' }} /> }}
                />
              </Text>
            </Flex>
          ))}
        </Box>
        <Box sx={{ mb: 3 }}>
          <Heading as="h3">{t('migrate.welcome-state.title-3')}</Heading>
          <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('migrate.welcome-state.description-2')}
          </Text>
        </Box>
        <FeesInformation
          estimatedGasPrice={{
            gasEstimation: 1500,
            gasEstimationStatus: GasEstimationStatus.calculated,
            gasEstimationEth: new BigNumber(0.04),
            gasEstimationUsd: new BigNumber(12),
          }}
        />
      </Grid>
    ),
    primaryButton: {
      isLoading: isLoading(),
      disabled: isLoading() || !state.can('NEXT_STEP'),
      label: t('migrate.button'),
      action: () => send('NEXT_STEP'),
    },
    requireConnection: true,
    requiredChainHexId: state.context.strategyConfig.networkHexId,
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
