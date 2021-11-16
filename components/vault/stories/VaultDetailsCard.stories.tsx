import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { ModalProps, useModal } from '../../../helpers/modalHook'
import {
  VaultDetailsCard,
  VaultDetailsCardCollateralLocked,
  VaultDetailsCardCollaterlizationRatioModal,
  VaultDetailsCardCurrentPrice,
  VaultDetailsCardLiquidationPrice,
  VaultDetailsCardModal,
} from '../VaultDetails'

const StopLossCollRatioModal = ({ close }: ModalProps) => (
  <VaultDetailsCardModal close={close}>StopLossCollRatioModal</VaultDetailsCardModal>
)

const MaxWidthWrapper = ({ children }: { children: ReactNode }) => (
  <Box sx={{ maxWidth: '337px' }}>{children}</Box>
)

interface CardsControl {
  hasAfter: boolean
  hasBottom: boolean
}

export const AllCards = (props: CardsControl) => {
  return (
    <Grid columns={2}>
      <StopLossCollRatioCard {...props} />
      <DynamicStopPrice {...props} />
      <MaxTokenOnStopLossTrigger {...props} />
      <CurrentPrice {...props} />
      <LiquidationPrice {...props} />
      <CollaterizationRatio {...props} />
      <CollateralLocked {...props} />
    </Grid>
  )
}

export const StopLossCollRatioCard = ({ hasAfter }: CardsControl) => {
  const { t } = useTranslation()
  const openModal = useModal()

  return (
    <MaxWidthWrapper>
      <VaultDetailsCard
        title={t('manage-multiply-vault.card.stop-loss-coll-ratio')}
        value="180%"
        valueAfter={hasAfter ? '180%' : ''}
        valueBottom={t('manage-multiply-vault.card.current-coll-ratio', { value: '220.00%' })}
        openModal={() => openModal(StopLossCollRatioModal)}
      />
    </MaxWidthWrapper>
  )
}

export const DynamicStopPrice = ({ hasAfter, hasBottom }: CardsControl) => {
  const { t } = useTranslation()
  const openModal = useModal()

  return (
    <MaxWidthWrapper>
      <VaultDetailsCard
        title={t('manage-multiply-vault.card.dynamic-stop-price')}
        value="$1,750.0"
        valueAfter={hasAfter ? '$1,750.0' : ''}
        valueBottom={
          hasBottom
            ? t('manage-multiply-vault.card.above-liquidation-price', { value: '$453.43' })
            : '-'
        }
        openModal={() => openModal(StopLossCollRatioModal)}
      />
    </MaxWidthWrapper>
  )
}

export const MaxTokenOnStopLossTrigger = ({ hasAfter, hasBottom }: CardsControl) => {
  const { t } = useTranslation()
  const openModal = useModal()

  return (
    <MaxWidthWrapper>
      <VaultDetailsCard
        title={t('manage-multiply-vault.card.max-token-on-stop-loss-trigger')}
        value="12.40 ETH"
        valueAfter={hasAfter ? '11.24' : ''}
        valueBottom={
          hasBottom
            ? t('manage-multiply-vault.card.saving-comp-to-liquidation', {
                value: '4.14 ETH',
              })
            : '-'
        }
        openModal={() => openModal(StopLossCollRatioModal)}
      />
    </MaxWidthWrapper>
  )
}

export const CurrentPrice = ({ hasBottom }: CardsControl) => {
  return (
    <MaxWidthWrapper>
      <VaultDetailsCardCurrentPrice
        // @ts-ignore // TODO this type should be given explicitly instead CommonVaultState
        priceInfo={{
          currentCollateralPrice: new BigNumber(4000),
          nextCollateralPrice: new BigNumber(4100),
          collateralPricePercentageChange: new BigNumber('0.01'),
          isStaticCollateralPrice: !hasBottom,
        }}
      />
    </MaxWidthWrapper>
  )
}

export const LiquidationPrice = ({ hasAfter, hasBottom }: CardsControl) => {
  return (
    <MaxWidthWrapper>
      <VaultDetailsCardLiquidationPrice
        liquidationPrice={new BigNumber(800)}
        afterLiquidationPrice={new BigNumber(900)}
        liquidationPriceCurrentPriceDifference={hasBottom ? new BigNumber(0.02) : undefined}
        showAfterPill={hasAfter}
      />
    </MaxWidthWrapper>
  )
}

export const CollaterizationRatio = ({ hasAfter, hasBottom }: CardsControl) => {
  const { t } = useTranslation()
  const openModal = useModal()

  return (
    <MaxWidthWrapper>
      <VaultDetailsCard
        title={t('system.collateralization-ratio')}
        value={
          <Text as="span" sx={{ color: 'onSuccess' }}>
            105.09%{' '}
          </Text>
        }
        valueBottom={
          hasBottom ? (
            <>
              <Text as="span" sx={{ color: 'onSuccess' }}>
                105.09%{' '}
              </Text>
              <Text as="span" sx={{ color: 'text.subtitle' }}>
                {t('manage-multiply-vault.card.on-next-price')}
              </Text>
            </>
          ) : null
        }
        valueAfter={hasAfter ? '106.00%' : ''}
        openModal={() =>
          openModal(VaultDetailsCardCollaterlizationRatioModal, {
            collateralRatioOnNextPrice: new BigNumber('1.0509'),
            currentCollateralRatio: new BigNumber('1.0509'),
          })
        }
      />
    </MaxWidthWrapper>
  )
}

export const CollateralLocked = ({ hasAfter, hasBottom }: CardsControl) => {
  return (
    <MaxWidthWrapper>
      <VaultDetailsCardCollateralLocked
        depositAmountUSD={new BigNumber(13000)}
        depositAmount={hasBottom ? new BigNumber(3) : undefined}
        afterDepositAmountUSD={new BigNumber(30000)}
        showAfterPill={hasAfter}
        token="ETH"
      />
    </MaxWidthWrapper>
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'Vault Details Cards',
  argTypes: {
    hasAfter: {
      description: 'Has after value',
      options: [true, false],
      control: { type: 'radio' },
      defaultValue: true,
    },
    hasBottom: {
      description: 'Has bottom value',
      options: [true, false],
      control: { type: 'radio' },
      defaultValue: true,
    },
  },
}
