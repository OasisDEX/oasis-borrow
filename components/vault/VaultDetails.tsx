import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { PriceInfo } from 'features/shared/priceInfo'
import { CommonVaultState, WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import React, { ReactNode } from 'react'
import { Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'

type CollRatioColor = 'primary' | 'onError' | 'onWarning' | 'onSuccess'

export type AfterPillProps = {
  showAfterPill?: boolean
  afterPillColors?: { color: string; bg: string }
}

export function getCollRatioColor(
  { inputAmountsEmpty, ilkData }: Pick<CommonVaultState, 'inputAmountsEmpty' | 'ilkData'>,
  collateralizationRatio: BigNumber,
): CollRatioColor {
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

  return collateralizationRatio.isZero()
    ? 'primary'
    : vaultWillBeAtRiskLevelDanger || vaultWillBeUnderCollateralized
    ? 'onError'
    : vaultWillBeAtRiskLevelWarning
    ? 'onWarning'
    : 'onSuccess'
}

export function getPriceChangeColor({
  collateralPricePercentageChange,
}: Pick<PriceInfo, 'collateralPricePercentageChange'>) {
  return collateralPricePercentageChange.isZero()
    ? 'text.muted'
    : collateralPricePercentageChange.gt(zero)
    ? 'onSuccess'
    : 'onError'
}

export function getAfterPillColors(collRatioColor: CollRatioColor) {
  if (collRatioColor === 'primary') {
    return {
      color: 'onSuccess',
      bg: 'success',
    }
  }

  return {
    color: collRatioColor,
    bg: collRatioColor.split('on')[1].toLowerCase(),
  }
}

export function VaultDetailsAfterPill({
  children,
  afterPillColors,
}: WithChildren & AfterPillProps) {
  return (
    <Card
      sx={{
        bg: 'success',
        color: 'onSuccess',
        fontWeight: 'semiBold',
        border: 'none',
        px: 2,
        py: 0,
        mt: 2,
        display: 'inline-block',
        lineHeight: 2,
        fontSize: 1,
        ...afterPillColors,
      }}
    >
      <Box sx={{ px: 1 }}>{children}</Box>
    </Card>
  )
}

export function VaultDetailsCard({
  title,
  value,
  valueBottom,
  valueAfter,
  afterPillColors,
  openModal,
  relevant = true,
}: {
  title: string
  value: ReactNode
  valueBottom?: ReactNode
  valueAfter?: ReactNode
  openModal?: () => void
  relevant?: Boolean
} & AfterPillProps) {
  return (
    <Card
      onClick={openModal}
      sx={{
        border: 'lightMuted',
        overflow: 'hidden',
        minHeight: '194px',
        display: 'flex',
        opacity: relevant ? 1 : 0.5,
        svg: {
          color: 'text.subtitle',
        },
        ...(openModal && {
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 'vaultDetailsCard',
            svg: {
              color: 'primary',
            },
          },
        }),
      }}
    >
      <Flex
        p={2}
        sx={{
          fontSize: 2,
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Box>
          <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="subheader" sx={{ fontWeight: 'semiBold', fontSize: 'inherit' }}>
              {title}
            </Text>
            {openModal && <Icon name="question_o" size="auto" width="20px" height="20px" />}
          </Flex>
          <Heading variant="header2" sx={{ fontWeight: 'semiBold', mt: openModal ? 0 : 1 }}>
            {value}
          </Heading>
          {valueAfter && (
            <VaultDetailsAfterPill afterPillColors={afterPillColors}>
              {valueAfter} after
            </VaultDetailsAfterPill>
          )}
        </Box>
        <Box sx={{ fontWeight: 'semiBold', minHeight: '1em' }}>{valueBottom}</Box>
      </Flex>
    </Card>
  )
}

export function VaultDetailsCardModal({
  close,
  children,
}: {
  close: () => void
  children: ReactNode
}) {
  return (
    <Modal close={close} sx={{ maxWidth: '530px', margin: '0 auto' }}>
      <ModalCloseIcon {...{ close }} />
      <Grid gap={4} p={4}>
        {children}
      </Grid>
    </Modal>
  )
}

export function VaultDetailsSummaryContainer({
  children,
  relevant = true,
}: WithChildren & { relevant?: boolean }) {
  return (
    <Card sx={{ borderRadius: 'large', border: 'lightMuted', opacity: relevant ? 1 : 0.5 }}>
      <Grid
        columns={[1, null, null, 3]}
        sx={{ py: 3, px: 2, alignItems: 'flex-start' }}
        gap={[4, null, null, 3]}
      >
        {children}
      </Grid>
    </Card>
  )
}

export function VaultDetailsSummaryItem({
  label,
  value,
  valueAfter,
  afterPillColors,
}: { label: ReactNode; value: ReactNode; valueAfter?: ReactNode } & AfterPillProps) {
  return (
    <Grid gap={1}>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', fontWeight: 'semiBold' }}>
        {label}
      </Text>
      <Text variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
        {value}
      </Text>
      {valueAfter && (
        <Box>
          <VaultDetailsAfterPill afterPillColors={afterPillColors}>
            {valueAfter} after
          </VaultDetailsAfterPill>
        </Box>
      )}
    </Grid>
  )
}
