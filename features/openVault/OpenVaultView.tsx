import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { UrgentAnnouncement } from 'components/Announcement'
import { useAppContext } from 'components/AppContextProvider'
import { VaultActionInput } from 'components/VaultActionInput'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { handleNumericInput } from 'helpers/input'
import { useObservableWithError } from 'helpers/observableHook'
import { unhandledCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Grid,
  Heading,
  Label,
  Slider,
  SxProps,
  Text,
} from 'theme-ui'

import { OpenVaultState } from './openVault'
import { OpenVaultAllowance, OpenVaultAllowanceStatus } from './OpenVaultAllowance'
import { createOpenVaultAnalytics$ } from './openVaultAnalytics'
import { OpenVaultButton } from './OpenVaultButton'
import { FormStage, getFormStage_ } from './openVaultConditions'
import { OpenVaultConfirmation, OpenVaultStatus } from './OpenVaultConfirmation'
import { OpenVaultDetails } from './OpenVaultDetails'
import { OpenVaultEditing } from './OpenVaultEditing'
import { OpenVaultErrors } from './OpenVaultErrors'
import { OpenVaultIlkDetails } from './OpenVaultIlkDetails'
import { OpenVaultProxy } from './OpenVaultProxy'
import { OpenVaultWarnings } from './OpenVaultWarnings'

function VaultTitle({ title, subtext }: { title: string; subtext?: string }) {
  return (
    <Box>
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
        {title}
      </Text>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {subtext}
      </Text>
    </Box>
  )
}

function ChooseStage(props: OpenVaultState) {
  const { t } = useTranslation()
  const chooseBorrow = () => props.setVaultType && props.setVaultType('borrow')
  const chooseLeverage = () => props.setVaultType && props.setVaultType('leverage')

  return (
    <>
      <VaultTitle title={t('vault-form.header.edit')} />
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
        {t('vault-form.header.leverage')}
      </Text>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {t('vault-form.subtext.leverage')}
      </Text>
      <Button onClick={chooseLeverage}>Leverage ETH</Button>
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
        {t('vault-form.header.borrow')}
      </Text>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {t('vault-form.subtext.borrow')}
      </Text>
      <Button onClick={chooseBorrow}>Borrow against {props.token}</Button>
    </>
  )
}

function TypeSwitch(props: OpenVaultState) {
  const toggle = () =>
    props.setVaultType &&
    props.setVaultType(props.stage === 'editingLeverage' ? 'borrow' : 'leverage')
  return (
    <Button variant="textual" onClick={toggle}>
      Switch to {props.stage === 'editingLeverage' ? 'borrow' : 'leverage'}
    </Button>
  )
}

function LeverageStage(props: OpenVaultState) {
  const { t } = useTranslation()
  console.log({ props })
  return (
    <>
      <TypeSwitch {...props} />
      <Label>
        <VaultActionInput
          action="Deposit"
          token={props.token}
          tokenUsdPrice={props.priceInfo.currentCollateralPrice}
          showMax={true}
          hasAuxiliary={true}
          onSetMax={props.updateLeverageDepositMax}
          amount={props.leverageDepositAmount}
          auxiliaryAmount={props.leverageDepositAmountUSD}
          onChange={handleNumericInput(props.updateLeverageDeposit!)}
          onAuxiliaryChange={handleNumericInput(props.updateLeverageDepositUSD!)}
          maxAmount={props.maxDepositAmount}
          maxAuxiliaryAmount={props.maxDepositAmountUSD}
          maxAmountLabel={'Balance'}
          hasError={false}
        />
      </Label>
      <Label>
        <Box>Multiple</Box>
        <Slider onChange={(e) => props.updateLeverage!(new BigNumber(e.target.value))} />
      </Label>

      <OpenVaultButton {...props} />
    </>
  )
}

function EditingStage(props: OpenVaultState) {
  const { t } = useTranslation()
  return (
    <>
      <TypeSwitch {...props} />
      <VaultTitle title={t('vault-form.header.edit')} subtext={t('vault-form.subtext.edit')} />
      <OpenVaultEditing {...props} />
      <OpenVaultErrors {...props} />
      <OpenVaultWarnings {...props} />
      <OpenVaultButton {...props} />
      <OpenVaultIlkDetails {...props} />
    </>
  )
}

function AllowanceStage(props: OpenVaultState) {
  const { t } = useTranslation()
  return (
    <>
      <VaultTitle
        title={t('vault-form.header.allowance')}
        subtext={t('vault-form.subtext.allowance')}
      />
      <OpenVaultAllowance {...props} />
      <OpenVaultErrors {...props} />
      <OpenVaultWarnings {...props} />
      <OpenVaultButton {...props} />
      <OpenVaultAllowanceStatus {...props} />
      <OpenVaultIlkDetails {...props} />
    </>
  )
}

function ProxyStage(props: OpenVaultState) {
  const { t } = useTranslation()
  return (
    <>
      <VaultTitle title={t('vault-form.header.proxy')} subtext={t('vault-form.subtext.proxy')} />
      <OpenVaultErrors {...props} />
      <OpenVaultWarnings {...props} />
      <OpenVaultButton {...props} />
      <OpenVaultProxy {...props} />
      <OpenVaultIlkDetails {...props} />
    </>
  )
}

function ReceiptStage(props: OpenVaultState) {
  const { t } = useTranslation()
  return (
    <>
      <VaultTitle title={t('vault-form.header.proxy')} subtext={t('vault-form.subtext.proxy')} />
      <OpenVaultConfirmation {...props} />
      <OpenVaultErrors {...props} />
      <OpenVaultWarnings {...props} />
      <OpenVaultButton {...props} />
      <OpenVaultStatus {...props} />
      <OpenVaultIlkDetails {...props} />
    </>
  )
}

function FormComponent(props: OpenVaultState) {
  const stage = getFormStage_(props)

  switch (stage) {
    case FormStage.CHOOSE_VAULT_TYPE:
      return <ChooseStage {...props} />
    case FormStage.EDITING:
      return <EditingStage {...props} />
    case FormStage.EDITING_LEVERAGE:
      return <LeverageStage {...props} />
    case FormStage.ALLOWANCE:
      return <AllowanceStage {...props} />
    case FormStage.PROXY:
      return <ProxyStage {...props} />
    case FormStage.RECEIPT:
      return <ReceiptStage {...props} />
    default:
      return unhandledCaseError(stage)
  }
}

function OpenVaultForm(props: OpenVaultState) {
  return (
    <Box>
      <Card variant="surface" sx={{ boxShadow: 'card', borderRadius: 'mediumLarge', px: 4, py: 3 }}>
        <Grid sx={{ mt: 2 }}>
          <FormComponent {...props} />
        </Grid>
      </Card>
    </Box>
  )
}

export function OpenVaultHeading(props: OpenVaultState & SxProps) {
  const { token, ilk, sx } = props
  const tokenInfo = getToken(token)
  const { t } = useTranslation()

  return (
    <Heading
      as="h1"
      variant="paragraph2"
      sx={{
        gridColumn: ['1', '1/3'],
        fontWeight: 'semiBold',
        borderBottom: 'light',
        pb: 3,
        ...sx,
      }}
    >
      <Flex sx={{ justifyContent: ['center', 'left'] }}>
        <Icon name={tokenInfo.iconCircle} size="26px" sx={{ verticalAlign: 'sub', mr: 2 }} />
        <Text>{t('vault.open-vault', { ilk })}</Text>
      </Flex>
    </Heading>
  )
}

export function OpenVaultContainer(props: OpenVaultState) {
  return (
    <Grid columns={['1fr', '2fr minmax(380px, 1fr)']} gap={5}>
      <OpenVaultHeading {...props} sx={{ display: ['block', 'none'] }} />
      <Box sx={{ order: [3, 1] }}>
        <OpenVaultDetails {...props} />
      </Box>
      <Divider sx={{ display: ['block', 'none'], order: [2, 0] }} />
      <Box sx={{ order: [1, 2] }}>
        <OpenVaultForm {...props} />
      </Box>
    </Grid>
  )
}

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { openVault$ } = useAppContext()
  const openVaultWithIlk$ = openVault$(ilk)

  const openVaultWithError = useObservableWithError(openVault$(ilk))

  useEffect(() => {
    const subscription = createOpenVaultAnalytics$(openVaultWithIlk$, trackingEvents).subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <Grid sx={{ width: '100%', zIndex: 1 }}>
      <UrgentAnnouncement />
      <WithLoadingIndicator
        {...openVaultWithError}
        customError={<Box>{openVaultWithError.error?.message}</Box>}
      >
        {(openVault) => <OpenVaultContainer {...openVault} />}
      </WithLoadingIndicator>
    </Grid>
  )
}
