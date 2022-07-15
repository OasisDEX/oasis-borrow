import { Trans } from 'next-i18next'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Card, Flex, Grid, Heading, Text } from 'theme-ui'

import { PriceInfo } from '../../../features/shared/priceInfo'
import { formatAmount, formatPercent } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { AppLink } from '../../Links'
import { getPriceChangeColor, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

export function VaultDetailsCardCurrentPriceModal({
  close,
  currentPrice,
  nextPriceWithChange,
}: ModalProps<{ currentPrice: ReactNode; nextPriceWithChange: ReactNode }>) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('manage-multiply-vault.card.current-price')}`}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.current-price-description')}
        </Text>
        <Card variant="vaultDetailsCardModal">
          <Heading variant="header3">{currentPrice}</Heading>
        </Card>
      </Grid>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('manage-multiply-vault.card.next-price')}`}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {`${t('manage-multiply-vault.card.next-price-description')}`}
        </Text>
        <Card variant="vaultDetailsCardModal">
          <Heading variant="header3">{nextPriceWithChange}</Heading>
        </Card>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          <Trans
            i18nKey="manage-multiply-vault.card.more-info-oracles"
            components={[
              <AppLink
                href="https://kb.oasis.app/help/the-oracle-security-module"
                withAccountPrefix={false}
                target="_blank"
                sx={{
                  display: 'inline-block',
                  color: 'primary100',
                  textDecoration: 'underline',
                }}
              />,
            ]}
          />
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}

export function VaultDetailsCardCurrentPrice({
  currentCollateralPrice,
  nextCollateralPrice,
  isStaticCollateralPrice,
  collateralPricePercentageChange,
}: Pick<
  PriceInfo,
  | 'currentCollateralPrice'
  | 'nextCollateralPrice'
  | 'isStaticCollateralPrice'
  | 'collateralPricePercentageChange'
>) {
  const openModal = useModal()
  const priceChangeColor = getPriceChangeColor({ collateralPricePercentageChange })

  const currentPrice = `$${formatAmount(currentCollateralPrice, 'USD')}`
  const nextPriceWithChange = (
    <>
      <Text>${formatAmount(nextCollateralPrice, 'USD')}</Text>
      <Text sx={{ ml: 2, fontSize: 1 }}>
        {formatPercent(collateralPricePercentageChange.times(100), { precision: 2 })}
      </Text>
    </>
  )

  return (
    <VaultDetailsCard
      title={`Current Price`}
      value={currentPrice}
      valueBottom={
        isStaticCollateralPrice ? null : (
          <Flex sx={{ whiteSpace: 'pre-wrap' }}>
            <Text sx={{ color: 'neutral80' }}>Next </Text>
            <Flex
              variant="paragraph2"
              sx={{ fontWeight: 'semiBold', alignItems: 'center', color: priceChangeColor }}
            >
              {nextPriceWithChange}
            </Flex>
          </Flex>
        )
      }
      openModal={() =>
        openModal(VaultDetailsCardCurrentPriceModal, {
          currentPrice,
          nextPriceWithChange: (
            <Flex sx={{ alignItems: 'center', color: priceChangeColor }}>
              {nextPriceWithChange}
            </Flex>
          ),
        })
      }
    />
  )
}
