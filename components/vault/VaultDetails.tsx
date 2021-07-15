import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { ModalProps, useModal } from 'helpers/modalHook'
import { CommonVaultState, WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Button, Card, Flex, Grid, Heading, Text } from 'theme-ui'

export function getCollRatioColor(
  { inputAmountsEmpty, ilkData }: CommonVaultState,
  collateralizationRatio: BigNumber,
) {
  const vaultWillBeAtRiskLevelDanger =
    !inputAmountsEmpty &&
    collateralizationRatio.gte(ilkData.liquidationRatio) &&
    collateralizationRatio.lte(ilkData.collateralizationDangerThreshold)

  const vaultWillBeAtRiskLevelWarning =
    !inputAmountsEmpty &&
    collateralizationRatio.gt(ilkData.collateralizationDangerThreshold) &&
    collateralizationRatio.lte(ilkData.collateralizationWarningThreshold)

  const vaultWillBeUnderCollateralized =
    !inputAmountsEmpty &&
    collateralizationRatio.lt(ilkData.liquidationRatio) &&
    !collateralizationRatio.isZero()

  const collRatioColor = collateralizationRatio.isZero()
    ? 'primary'
    : vaultWillBeAtRiskLevelDanger || vaultWillBeUnderCollateralized
    ? 'onError'
    : vaultWillBeAtRiskLevelWarning
    ? 'onWarning'
    : 'onSuccess'

  return collRatioColor
}

export function getPriceChangeColor({
  priceInfo: { collateralPricePercentageChange },
}: CommonVaultState) {
  const priceChangeColor = collateralPricePercentageChange.isZero()
    ? 'text.muted'
    : collateralPricePercentageChange.gt(zero)
    ? 'onSuccess'
    : 'onError'

  return priceChangeColor
}

export function VaultDetailsCard({
  title,
  value,
  valueBottom,
  openModal,
}: {
  title: string
  value: ReactNode
  valueBottom?: ReactNode
  openModal?: () => void
}) {
  return (
    <Card sx={{ border: 'lightMuted', overflow: 'hidden' }}>
      <Box p={2} sx={{ fontSize: 2 }}>
        <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="subheader" sx={{ fontWeight: 'semiBold', fontSize: 'inherit' }}>
            {title}
          </Text>
          {openModal && (
            <Button
              variant="secondary"
              onClick={openModal}
              sx={{
                py: 1,
                px: 3,
                fontSize: 1,
                lineHeight: 'bodyLoose',
                minWidth: '138px',
                cursor: 'pointer',
              }}
            >
              See breakdown
            </Button>
          )}
        </Flex>
        <Heading variant="header2" sx={{ fontWeight: 'semiBold', mt: 1 }}>
          {value}
        </Heading>
        <Box sx={{ mt: 5, fontWeight: 'semiBold', minHeight: '1em' }}>{valueBottom}</Box>
      </Box>
    </Card>
  )
}

function VaultDetailsCardModal({ close, children }: { close: () => void; children: ReactNode }) {
  return (
    <Modal close={close} sx={{ maxWidth: '530px', margin: '0 auto' }}>
      <ModalCloseIcon {...{ close }} />
      <Grid gap={4} p={4}>
        {children}
      </Grid>
    </Modal>
  )
}

function VaultDetailsCardCurrentPriceModal({
  close,
  currentPrice,
  nextPriceWithChange,
}: ModalProps<{ currentPrice: ReactNode; nextPriceWithChange: ReactNode }>) {
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">Current Price</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tempor auctor eget magna ac enim
          lorem tincidunt.
        </Text>
        <Card variant="vaultDetailsModal">
          <Heading variant="header3">{currentPrice}</Heading>
        </Card>
      </Grid>
      <Grid gap={2}>
        <Heading variant="header3">Next Price</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tempor auctor eget magna ac enim
          lorem tincidunt.
        </Text>
        <Card variant="vaultDetailsModal">
          <Heading variant="header3">{nextPriceWithChange}</Heading>
        </Card>
      </Grid>
    </VaultDetailsCardModal>
  )
}

export function VaultDetailsCardCurrentPrice(props: CommonVaultState) {
  const {
    priceInfo: {
      currentCollateralPrice,
      nextCollateralPrice,
      isStaticCollateralPrice,
      collateralPricePercentageChange,
    },
  } = props
  const openModal = useModal()
  const priceChangeColor = getPriceChangeColor(props)

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
            <Text sx={{ color: 'text.subtitle' }}>Next </Text>
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

export function VaultDetailsCardCollateralLocked({
  depositAmountUSD,
  depositAmount,
  token,
}: {
  depositAmountUSD?: BigNumber
  depositAmount?: BigNumber
  token: string
}) {
  const { t } = useTranslation()

  return (
    <VaultDetailsCard
      title={`${t('system.collateral-locked')}`}
      value={`$${formatAmount(depositAmountUSD || zero, 'USD')}`}
      valueBottom={
        <>
          {formatAmount(depositAmount || zero, getToken(token).symbol)}
          <Text as="span" sx={{ color: 'text.subtitle' }}>
            {` ${getToken(token).symbol}`}
          </Text>
        </>
      }
    />
  )
}

export function VaultDetailsSummaryContainer({ children }: WithChildren) {
  return (
    <Card sx={{ borderRadius: 'large', border: 'lightMuted' }}>
      <Grid columns={3} sx={{ py: 3, px: 2 }}>
        {children}
      </Grid>
    </Card>
  )
}

export function VaultDetailsSummaryItem({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <Grid gap={1}>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', fontWeight: 'semiBold' }}>
        {label}
      </Text>
      <Text variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
        {value}
      </Text>
    </Grid>
  )
}
