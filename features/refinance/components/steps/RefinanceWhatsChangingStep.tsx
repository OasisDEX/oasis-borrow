import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import { RefinanceValidationMessages } from 'features/refinance/components/RefinanceValidationMessages'
import { RefinanceHighlightedChangeSection } from 'features/refinance/components/steps/RefinanceHighlightedChangeSection'
import { RefinanceReviewChangesSection } from 'features/refinance/components/steps/RefinanceReviewChangesSection'
import { RefinanceRouteSection } from 'features/refinance/components/steps/RefinanceRouteSection'
import { RefinanceSwapSection } from 'features/refinance/components/steps/RefinanceSwapSection'
import { useRefinanceContext } from 'features/refinance/contexts'
import { formatFiatBalance } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Image, Text } from 'theme-ui'

export const RefinanceWhatsChangingStep = () => {
  const { t } = useTranslation()

  const {
    environment: { gasEstimation, collateralPrice, debtPrice },
    metadata: {
      validations: { errors, warnings, notices, successes },
    },
    position: { positionId },
    simulation: { refinanceSimulation },
    tx: { isTxSuccess, isTxInProgress },
    form: {
      state: { dpm },
    },
  } = useRefinanceContext()

  if (isTxSuccess) {
    return (
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('refinance.sidebar.transaction.description.success', {
          oldId: positionId.id,
          newId: dpm?.id,
        })}
        <Flex sx={{ justifyContent: 'center', mt: 3 }}>
          <Image src={staticFilesRuntimeUrl('/static/img/refinance-tx.svg')} />
        </Flex>
      </Text>
    )
  }

  if (isTxInProgress) {
    return (
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('refinance.sidebar.transaction.description.in-progress')}
        <Flex sx={{ justifyContent: 'center', mt: 3 }}>
          <Image src={staticFilesRuntimeUrl('/static/img/refinance-tx.svg')} />
        </Flex>
      </Text>
    )
  }

  let summerFee = new BigNumber(0)
  const { swaps, sourcePosition } = refinanceSimulation || {}

  swaps?.forEach((swap) => {
    const isCollateral =
      swap.fromTokenAmount.token.symbol === sourcePosition?.collateralAmount.token.symbol
    const feePrice = new BigNumber(isCollateral ? collateralPrice : debtPrice)
    const fee = new BigNumber(swap.summerFee.amount).times(feePrice)
    summerFee = summerFee.plus(fee)
  })

  const formatted = {
    summerFee: `$${formatFiatBalance(summerFee)}`,
  }

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('refinance.sidebar.whats-changing.description')}
      </Text>
      <RefinanceHighlightedChangeSection />
      <RefinanceReviewChangesSection />
      <RefinanceSwapSection />
      <RefinanceRouteSection />
      <RefinanceValidationMessages validations={errors} type="error" />
      <RefinanceValidationMessages validations={warnings} type="warning" />
      <RefinanceValidationMessages validations={notices} type="notice" />
      <RefinanceValidationMessages validations={successes} type="success" />
      <InfoSection
        items={[
          {
            label: t('refinance.sidebar.whats-changing.summerfi-fee'),
            value: formatted.summerFee,
            tooltip: t('refinance.sidebar.whats-changing.summerfi-fee'),
            isLoading: !refinanceSimulation,
          },
          {
            label: t('system.max-transaction-cost'),
            value: <>{getEstimatedGasFeeText(gasEstimation)}</>,
            isLoading: !gasEstimation,
          },
        ]}
      />
    </>
  )
}
