import type BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { TokensGroup } from 'components/TokensGroup'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Text } from 'theme-ui'

interface PoolCreatorFormOrderProps {
  collateralToken: string
  interestRate: BigNumber
  isLoading: boolean
  quoteToken: string
}

export function PoolCreatorFormOrder({
  collateralToken,
  interestRate,
  isLoading,
  quoteToken,
}: PoolCreatorFormOrderProps) {
  const { t } = useTranslation()

  const formatted = {
    interestRate: `${interestRate}%`,
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('pool-creator.order-information.pool'),
          value: (
            <Flex sx={{ alignItems: 'center' }}>
              <TokensGroup tokens={[collateralToken, quoteToken]} forceSize={18} sx={{ mr: 1 }} />
              <Text as="strong">
                {collateralToken}/{quoteToken}
              </Text>
            </Flex>
          ),
          isLoading,
        },
        {
          label: t('pool-creator.order-information.initial-interest-rate'),
          value: formatted.interestRate,
          isLoading,
        },
      ]}
    />
  )
}
