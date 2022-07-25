import { Story } from '@storybook/react'
import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { ModalProvider, useModal } from '../../../helpers/modalHook'
import { VaultDetailsCardCollateralLocked } from '../detailsCards/VaultDetailsCardCollateralLocked'
import { VaultDetailsCardCollaterlizationRatioModal } from '../detailsCards/VaultDetailsCardCollaterlizationRatio'
import { VaultDetailsCardCurrentPrice } from '../detailsCards/VaultDetailsCardCurrentPrice'
import { VaultDetailsCardDynamicStopPrice } from '../detailsCards/VaultDetailsCardDynamicStopPrice'
import { VaultDetailsCardLiquidationPrice } from '../detailsCards/VaultDetailsCardLiquidationPrice'
import { VaultDetailsCardMaxTokenOnStopLossTrigger } from '../detailsCards/VaultDetailsCardMaxTokenOnStopLossTrigger'
import { VaultDetailsCardStopLossCollRatio } from '../detailsCards/VaultDetailsCardStopLossCollRatio'
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

export const StopLossCollRatioCard = ({ hasAfter, isProtected }: CardsControl) => {
  return (
    <MaxWidthWrapper>
      <VaultDetailsCardStopLossCollRatio
        slRatio={new BigNumber(160)}
        afterSlRatio={new BigNumber(180)}
        collateralizationRatioAtNextPrice={new BigNumber(200)}
        showAfterPill={hasAfter}
        isProtected={isProtected}
      />
    </MaxWidthWrapper>
  )
}

export const DynamicStopPrice = ({ hasAfter, isProtected }: CardsControl) => {
  return (
    <MaxWidthWrapper>
      <VaultDetailsCardDynamicStopPrice
        slRatio={new BigNumber(1.6)}
        afterSlRatio={new BigNumber(1.7)}
        liquidationPrice={new BigNumber(900)}
        liquidationRatio={new BigNumber(1.5)}
        showAfterPill={hasAfter}
        isProtected={isProtected}
      />
    </MaxWidthWrapper>
  )
}

export const MaxTokenOnStopLossTrigger = ({ hasAfter, isProtected }: CardsControl) => {
  return (
    <MaxWidthWrapper>
      <VaultDetailsCardMaxTokenOnStopLossTrigger
        slRatio={new BigNumber(1.6)}
        afterSlRatio={new BigNumber(1.7)}
        liquidationPrice={new BigNumber(2000)}
        liquidationPenalty={new BigNumber(0.1)}
        isProtected={isProtected}
        debt={new BigNumber(12000)}
        lockedCollateral={new BigNumber(20)}
        liquidationRatio={new BigNumber(1.3)}
        token="ETH"
        showAfterPill={hasAfter}
        isCollateralActive={true}
        tokenPrice={new BigNumber(2000)}
      />
    </MaxWidthWrapper>
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
        vaultId={new BigNumber(1)}
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
