import { Story } from '@storybook/react'
import { BigNumber } from 'bignumber.js'
import { ModalProvider, useModal } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { VaultDetailsCardCollateralLocked } from '../detailsCards/VaultDetailsCardCollateralLocked'
import { VaultDetailsCardCollaterlizationRatioModal } from '../detailsCards/VaultDetailsCardCollaterlizationRatio'
import { VaultDetailsCardCurrentPrice } from '../detailsCards/VaultDetailsCardCurrentPrice'
import { VaultDetailsCardLiquidationPrice } from '../detailsCards/VaultDetailsCardLiquidationPrice'
import { VaultDetailsCard } from '../VaultDetails'

const MaxWidthWrapper = ({ children }: { children: ReactNode }) => (
  <Box sx={{ maxWidth: '337px' }}>{children}</Box>
)

interface CardsControl {
  hasAfter: boolean
  hasBottom: boolean
  isProtected: boolean
}

export const AllCards = (props: CardsControl) => {
  return (
    <Grid columns={2}>
      <CurrentPrice {...props} />
      <LiquidationPrice {...props} />
      <CollaterizationRatio {...props} />
      <CollateralLocked {...props} />
    </Grid>
  )
}

export const CurrentPrice = ({ hasBottom }: CardsControl) => {
  return (
    <MaxWidthWrapper>
      <VaultDetailsCardCurrentPrice
        currentCollateralPrice={new BigNumber(4000)}
        nextCollateralPrice={new BigNumber(4100)}
        collateralPricePercentageChange={new BigNumber('0.01')}
        isStaticCollateralPrice={!hasBottom}
      />
    </MaxWidthWrapper>
  )
}

export const LiquidationPrice = ({ hasAfter, hasBottom }: CardsControl) => {
  return (
    <MaxWidthWrapper>
      <VaultDetailsCardLiquidationPrice
        liquidationPrice={new BigNumber(800)}
        liquidationRatio={new BigNumber(1.2)}
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
          <Text as="span" sx={{ color: 'success100' }}>
            105.09%{' '}
          </Text>
        }
        valueBottom={
          hasBottom ? (
            <>
              <Text as="span" sx={{ color: 'success100' }}>
                105.09%{' '}
              </Text>
              <Text as="span" sx={{ color: 'neutral80' }}>
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
    isProtected: {
      description: 'Has protection enabled',
      options: [true, false],
      control: { type: 'radio' },
      defaultValue: true,
    },
  },
  decorators: [
    (Story: Story) => (
      <ModalProvider>
        <Story />
      </ModalProvider>
    ),
  ],
}
