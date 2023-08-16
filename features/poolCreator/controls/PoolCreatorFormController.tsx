import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { INTEREST_RATE_STEP } from 'features/poolCreator/consts'
import { usePoolCreatorFormReducto } from 'features/poolCreator/state/poolCreatorFormReducto'
import { formatAddress } from 'helpers/formatters/format'
import { TextInput } from 'helpers/TextInput'
import { useTranslation } from 'next-i18next'
import React, { FC } from 'react'

interface PoolCreatorFormControllerProps {
  form: ReturnType<typeof usePoolCreatorFormReducto>
  minInterestRate: BigNumber
  maxInterestRate: BigNumber
}

export const PoolCreatorFormController: FC<PoolCreatorFormControllerProps> = ({
  form: {
    state: { collateralAddress, interestRate, quoteAddress },
    updateState,
  },
  minInterestRate,
  maxInterestRate,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <TextInput
        label={t('pool-creator.form.collateral-token-address')}
        placeholder={formatAddress(getNetworkContracts(NetworkIds.MAINNET).tokens.ETH.address)}
        value={collateralAddress}
        onChange={(value) => updateState('collateralAddress', value)}
      />
      <TextInput
        label={t('pool-creator.form.quote-token-address')}
        placeholder={formatAddress(getNetworkContracts(NetworkIds.MAINNET).tokens.USDC.address)}
        value={quoteAddress}
        onChange={(value) => updateState('quoteAddress', value)}
      />
      <SliderValuePicker
        disabled={false}
        lastValue={interestRate}
        minBoundry={minInterestRate}
        leftLabel={t('pool-creator.form.pools-interest-rate')}
        leftBoundry={interestRate}
        leftBoundryFormatter={(value) => `${value.toFixed(1)}%`}
        leftBottomLabel={`Minimum ${minInterestRate}%`}
        rightBottomLabel={`Up to ${maxInterestRate}%`}
        maxBoundry={maxInterestRate}
        onChange={(value) => updateState('interestRate', value)}
        step={INTEREST_RATE_STEP}
      />
    </>
  )
}
