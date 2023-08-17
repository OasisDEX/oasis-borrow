import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { DetailsSection } from 'components/DetailsSection'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { PoolCreatorLoadingState } from 'features/poolCreator/components/PoolCreatorLoadingState'
import { DEFAULT_POOL_INTEREST_RATE } from 'features/poolCreator/consts'
import { PoolCreatorActionController } from 'features/poolCreator/controls/PoolCreatorActionController'
import { PoolCreatorFormController } from 'features/poolCreator/controls/PoolCreatorFormController'
import { usePoolCreatorData } from 'features/poolCreator/hooks/usePoolCreatorData'
import { usePoolCreatorFormReducto } from 'features/poolCreator/state/poolCreatorFormReducto'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box } from 'theme-ui'

export function AjnaPoolCreatorController() {
  const { t } = useTranslation()

  const form = usePoolCreatorFormReducto({
    collateralAddress: '',
    interestRate: DEFAULT_POOL_INTEREST_RATE,
    quoteAddress: '',
  })
  const {
    state: { collateralAddress, interestRate, quoteAddress },
  } = form

  const {
    boundries,
    collateralToken,
    errors,
    isFormReady,
    isFormValid,
    isLoading,
    onSubmit,
    quoteToken,
    txSidebarStatus,
    txStatuses,
  } = usePoolCreatorData({
    collateralAddress,
    interestRate,
    quoteAddress,
  })

  return (
    <WithConnection>
      <AnimatedWrapper sx={{ mb: 5 }}>
        <AjnaHeader title={t('pool-creator.header.title')} intro={t('pool-creator.header.intro')} />
        <Box sx={{ maxWidth: '584px', mx: 'auto' }}>
          <WithLoadingIndicator
            value={[boundries, isFormReady]}
            customLoader={<PoolCreatorLoadingState />}
          >
            {([{ min, max }]) => (
              <DetailsSection
                title={t('pool-creator.form.title')}
                loose
                content={
                  <PoolCreatorFormController
                    collateralToken={collateralToken}
                    errors={errors}
                    form={form}
                    isFormValid={isFormValid}
                    isLoading={isLoading}
                    maxInterestRate={max}
                    minInterestRate={min}
                    quoteToken={quoteToken}
                    txStatuses={txStatuses}
                  />
                }
                footer={
                  <PoolCreatorActionController
                    collateralAddress={collateralAddress}
                    isFormValid={isFormValid}
                    isLoading={isLoading}
                    quoteAddress={quoteAddress}
                    onSubmit={onSubmit}
                    txSidebarStatus={txSidebarStatus}
                    txStatuses={txStatuses}
                  />
                }
              />
            )}
          </WithLoadingIndicator>
        </Box>
      </AnimatedWrapper>
    </WithConnection>
  )
}
