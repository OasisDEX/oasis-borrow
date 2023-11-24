import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { DetailsSection } from 'components/DetailsSection'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { PoolCreatorLoadingState } from 'features/ajna/pool-creator/components'
import { DEFAULT_POOL_INTEREST_RATE } from 'features/ajna/pool-creator/constants'
import {
  PoolCreatorActionController,
  PoolCreatorFormController,
} from 'features/ajna/pool-creator/controls'
import { usePoolCreatorData } from 'features/ajna/pool-creator/hooks'
import { usePoolCreatorFormReducto } from 'features/ajna/pool-creator/state'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { Trans, useTranslation } from 'next-i18next'
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
        <AjnaHeader
          title={t('pool-creator.header.title')}
          intro={
            <Trans
              i18nKey="pool-creator.header.intro"
              components={{
                AppLink: (
                  <AppLink href={EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_CREATE_A_POOL} sx={{ pr: 3 }} />
                ),
                WithArrow: (
                  <WithArrow
                    variant="paragraph2"
                    sx={{
                      display: 'inline-block',
                      fontSize: 3,
                      color: 'interactive100',
                      fontWeight: 'regular',
                    }}
                  />
                ),
              }}
            />
          }
        />
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
