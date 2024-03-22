import BigNumber from 'bignumber.js'
import { getTransactionFee } from 'blockchain/transaction-fee'
import { Icon } from 'components/Icon'
import { InfoSection } from 'components/infoSection/InfoSection'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import { useTransactionCostWithLoading } from 'features/aave/hooks/useTransactionCostWithLoading'
import { GasEstimationStatus, type HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { LendingProtocolLabel } from 'lendingProtocols'
import React, { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { tick } from 'theme/icons'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import type { MigrateAaveStateProps } from './migrateAaveStateProps'

const useMigrationTransactionCostWithLoading = ({
  state,
}: Pick<MigrateAaveStateProps, 'state'>) => {
  const [transactionCost, setTransactionCost] = React.useState<HasGasEstimation>({
    gasEstimationStatus: GasEstimationStatus.calculating,
  })

  const gasForAllowanceDpmAndMigration = 150_000 + 50_000 + 1_500_000

  const { networkId } = state.context.strategyConfig

  useEffect(() => {
    setTransactionCost({
      gasEstimationStatus: GasEstimationStatus.calculating,
      gasEstimation: gasForAllowanceDpmAndMigration,
    })
    getTransactionFee({ estimatedGas: gasForAllowanceDpmAndMigration.toString(), networkId })
      .then((transactionFee) => {
        if (!transactionFee) {
          setTransactionCost({
            gasEstimationStatus: GasEstimationStatus.error,
            gasEstimation: gasForAllowanceDpmAndMigration,
          })
          return
        }
        setTransactionCost({
          gasEstimationStatus: GasEstimationStatus.calculated,
          gasEstimation: gasForAllowanceDpmAndMigration,
          gasEstimationEth: new BigNumber(transactionFee.fee),
          gasEstimationUsd: new BigNumber(transactionFee.feeUsd),
        })
      })
      .catch((error) => {
        console.error('Failed to get transaction fee', error)
        setTransactionCost({
          gasEstimationStatus: GasEstimationStatus.error,
          gasEstimationEth: new BigNumber(gasForAllowanceDpmAndMigration),
        })
      })
  }, [gasForAllowanceDpmAndMigration, networkId])

  return useTransactionCostWithLoading({
    transactionCost: transactionCost,
  })
}

export function MigrateWelcomeStateView({
  state,
  send,
  isLoading,
  isLocked,
}: MigrateAaveStateProps) {
  const { t } = useTranslation()

  const transactionCostWithLoader = useMigrationTransactionCostWithLoading({ state })

  const protocol = LendingProtocolLabel[state.context.strategyConfig.protocol]

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('migrate.vault-form.title'),
    content: (
      <Grid gap={3}>
        <Box sx={{ textAlign: 'center', m: 3 }}>
          <Heading as="h3">{t('migrate.welcome-state.title-1', { protocol })}</Heading>
          <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('migrate.welcome-state.description-1', { protocol })}
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
      isLoading: isLoading(),
      disabled: isLoading() || isLocked(state) || !state.can('NEXT_STEP'),
      label: t('migrate.button'),
      action: () => send('NEXT_STEP'),
    },
    requireConnection: true,
    requiredChainHexId: state.context.strategyConfig.networkHexId,
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
