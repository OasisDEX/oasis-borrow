import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import { MigrateToSummerIcons } from 'features/aave/components/MigrateToSummerIcons'
import { getAaveLikePositionUrl } from 'helpers/getAaveLikeStrategyUrl'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { dot } from 'theme/icons'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import type { MigrateAaveStateProps } from './migrateAaveStateProps'

export function MigrateAaveSuccessStateView({ state }: MigrateAaveStateProps) {
  const { t } = useTranslation()
  const userDpmAccount = state.context.userDpmAccount
  const { protocol, network } = state.context.strategyConfig
  const url = userDpmAccount
    ? getAaveLikePositionUrl({ protocol, network, userDpmAccount })
    : undefined

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('migrate.vault-form.success-title'),
    content: (
      <Grid gap={3}>
        <MigrateToSummerIcons fromProtocol={protocol} success />
        <Box sx={{ mb: 3 }}>
          <Heading as="h3">{t('migrate.success-state.title-1')}</Heading>
          <Flex sx={{ flexDirection: 'column', mt: 2 }}>
            {[
              ['migrate.success-state.description-points-1', url ?? `${url}#protection`],
              ['migrate.success-state.description-points-2', url ?? `${url}#adjust`],
              ['migrate.success-state.description-points-3'],
            ].map(([descriptionPoint, descriptionPointUrl]) => (
              <Flex
                key={descriptionPoint}
                sx={{ flexDirection: 'row', alignItems: 'center', mt: 2 }}
              >
                <Box sx={{ mx: 3 }}>
                  <Icon icon={dot} size={'4px'} color="neutral80" />
                </Box>
                <Text variant="paragraph3" sx={{ display: 'block', color: 'neutral80' }}>
                  <Trans
                    i18nKey={descriptionPoint}
                    components={{
                      1: <AppLink href={descriptionPointUrl || ''} sx={{ fontSize: 2 }} />,
                      strong: <Text sx={{ fontWeight: 'semiBold' }} />,
                    }}
                  />
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Grid>
    ),
    primaryButton: {
      label: t('migrate.go-to-position'),
      url: url,
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
