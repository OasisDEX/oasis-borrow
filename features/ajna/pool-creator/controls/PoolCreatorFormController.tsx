import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { MessageCard } from 'components/MessageCard'
import { Skeleton } from 'components/Skeleton'
import { PoolCreatorFormOrder } from 'features/ajna/pool-creator/components'
import {
  DEFAULT_MAX_POOL_INTEREST_RATE,
  DEFAULT_MIN_POOL_INTEREST_RATE,
  DEFAULT_POOL_INTEREST_RATE,
  INTEREST_RATE_STEP,
} from 'features/ajna/pool-creator/constants'
import type { usePoolCreatorFormReducto } from 'features/ajna/pool-creator/state'
import type { TxStatuses } from 'features/omni-kit/contexts'
import type { OmniValidationItem } from 'features/omni-kit/types'
import { formatAddress } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { TextInput } from 'helpers/TextInput'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Box, Flex, Grid, Image } from 'theme-ui'

interface PoolCreatorFormControllerProps {
  collateralToken: string
  errors: OmniValidationItem[]
  form: ReturnType<typeof usePoolCreatorFormReducto>
  isFormReady: boolean
  isFormValid: boolean
  isLoading: boolean
  maxInterestRate?: BigNumber
  minInterestRate?: BigNumber
  quoteToken: string
  txStatuses: TxStatuses
}

export const PoolCreatorFormController: FC<PoolCreatorFormControllerProps> = ({
  collateralToken,
  errors,
  form: {
    state: { collateralAddress, interestRate, quoteAddress },
    updateState,
  },
  isFormReady,
  isLoading,
  isFormValid,
  minInterestRate,
  maxInterestRate,
  quoteToken,
  txStatuses: { isTxInProgress, isTxSuccess, isTxWaitingForApproval },
}) => {
  const { t } = useTranslation()

  const isFormDisabled = !isFormReady || isTxInProgress || isTxWaitingForApproval

  const errorsWithTranslations = errors.map(
    ({ message: { component, params, translationKey } }) => {
      return (
        <>
          {translationKey && t(`pool-creator.validations.${translationKey}`, params)}
          {component}
        </>
      )
    },
  )

  return (
    <Grid gap={4}>
      {isTxSuccess ? (
        <Flex sx={{ justifyContent: 'center' }}>
          <Image src={staticFilesRuntimeUrl('/static/img/generic-success-icon.svg')} />
        </Flex>
      ) : (
        <>
          <TextInput
            large
            muted
            disabled={isFormDisabled}
            label={t('pool-creator.form.collateral-token-address')}
            placeholder={formatAddress(getNetworkContracts(NetworkIds.MAINNET).tokens.ETH.address)}
            value={collateralAddress}
            onChange={(value) => updateState('collateralAddress', value)}
          />
          <TextInput
            large
            muted
            disabled={isFormDisabled}
            label={t('pool-creator.form.quote-token-address')}
            placeholder={formatAddress(getNetworkContracts(NetworkIds.MAINNET).tokens.USDC.address)}
            value={quoteAddress}
            onChange={(value) => updateState('quoteAddress', value)}
          />
          {minInterestRate && maxInterestRate ? (
            <SliderValuePicker
              disabled={isFormDisabled}
              largeBoundry
              lastValue={interestRate}
              minBoundry={minInterestRate}
              leftLabel={t('pool-creator.form.pools-interest-rate')}
              rightBoundry={interestRate}
              rightBoundryFormatter={(value) => `${value.toFixed(1)}%`}
              leftBottomLabel={t('pool-creator.form.min-interest-rate', { minInterestRate })}
              rightBottomLabel={t('pool-creator.form.max-interest-rate', { maxInterestRate })}
              maxBoundry={maxInterestRate}
              onChange={(value) => updateState('interestRate', value)}
              step={INTEREST_RATE_STEP}
            />
          ) : (
            <Box sx={{ mt: '6px' }}>
              <SliderValuePicker
                disabled={true}
                largeBoundry
                lastValue={DEFAULT_POOL_INTEREST_RATE}
                minBoundry={DEFAULT_MIN_POOL_INTEREST_RATE}
                leftLabel={t('pool-creator.form.pools-interest-rate')}
                leftBottomLabel={<Skeleton width="80px" sx={{ my: '2px' }} />}
                rightBottomLabel={<Skeleton width="80px" sx={{ my: '2px' }} />}
                maxBoundry={DEFAULT_MAX_POOL_INTEREST_RATE}
                onChange={() => {}}
                step={INTEREST_RATE_STEP}
              />
            </Box>
          )}
          <MessageCard
            messages={errorsWithTranslations}
            type="error"
            withBullet={errors.length > 1}
          />
        </>
      )}
      {isFormValid && (
        <PoolCreatorFormOrder
          interestRate={interestRate}
          isLoading={isLoading}
          collateralToken={collateralToken}
          quoteToken={quoteToken}
        />
      )}
    </Grid>
  )
}
