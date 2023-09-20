import { AppLink } from 'components/Links'
import {
  getPriceChangeColor,
  VaultDetailsCard,
  VaultDetailsCardModal,
} from 'components/vault/VaultDetails'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import type { ModalProps } from 'helpers/modalHook'
import { useModal } from 'helpers/modalHook'
import { Trans, useTranslation } from 'next-i18next'
import type { ReactNode } from 'react'
import React from 'react'
import { Card, Flex, Grid, Heading, Text } from 'theme-ui'

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
        <Text variant="paragraph3" sx={{ pb: 2 }}>
          {t('manage-multiply-vault.card.current-price-description')}
        </Text>
        <Card variant="vaultDetailsCardModal">
          <Heading variant="header3">{currentPrice}</Heading>
        </Card>
      </Grid>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('manage-multiply-vault.card.next-price')}`}</Heading>
        <Text variant="paragraph3" sx={{ pb: 2 }}>
          {`${t('manage-multiply-vault.card.next-price-description')}`}
        </Text>
        <Card variant="vaultDetailsCardModal">
          <Heading variant="header3">{nextPriceWithChange}</Heading>
        </Card>
        <Text variant="paragraph3" sx={{ pb: 2 }}>
          <Trans
            i18nKey="manage-multiply-vault.card.more-info-oracles"
            components={[
              <AppLink
                href={EXTERNAL_LINKS.KB.ORACLE_SECURITY}
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
