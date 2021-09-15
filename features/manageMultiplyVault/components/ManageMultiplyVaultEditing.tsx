import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import {
  formatAmount,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import React from 'react'
import ReactSelect from 'react-select'
import { Box, Button, Card, Divider, Flex, Grid, Slider, Text, useThemeUI } from 'theme-ui'

import { ManageMultiplyVaultState, OtherAction } from '../manageMultiplyVault'
import { MAX_COLL_RATIO } from '../manageMultiplyVaultCalculations'
import { ManageMultiplyVaultChangesInformation } from './ManageMultiplyVaultChangesInformation'

//TODO max buy token
function BuyTokenInput({
  vault: { token },
  updateBuy,
  updateBuyUSD,
  updateBuyMax,
  buyAmountUSD,
  buyAmount,
  priceInfo: { currentCollateralPrice },
}: ManageMultiplyVaultState) {
  const maxDepositAmount = zero
  const maxDepositAmountUSD = zero

  return (
    <VaultActionInput
      action="Buy"
      token={token}
      tokenUsdPrice={currentCollateralPrice}
      showMax={true}
      hasAuxiliary={true}
      onSetMax={updateBuyMax!}
      maxAmountLabel={'Buying power'}
      amount={buyAmount}
      auxiliaryAmount={buyAmountUSD}
      maxAmount={maxDepositAmount}
      maxAuxiliaryAmount={maxDepositAmountUSD}
      onChange={handleNumericInput(updateBuy!)}
      onAuxiliaryChange={handleNumericInput(updateBuyUSD!)}
      hasError={false}
    />
  )
}

//TODO max sell token
function SellTokenInput({
  accountIsController,
  updateSell,
  updateSellUSD,
  updateSellMax,
  sellAmount,
  sellAmountUSD,
  vault: { token, freeCollateral, freeCollateralUSD },
  priceInfo: { currentCollateralPrice },
}: ManageMultiplyVaultState) {
  return (
    <VaultActionInput
      action="Sell"
      amount={sellAmount}
      tokenUsdPrice={currentCollateralPrice}
      token={token}
      showMax={true}
      hasAuxiliary={true}
      disabled={!accountIsController}
      maxAmount={freeCollateral}
      maxAmountLabel={'Max'}
      onSetMax={updateSellMax}
      onChange={handleNumericInput(updateSell!)}
      auxiliaryAmount={sellAmountUSD}
      maxAuxiliaryAmount={freeCollateralUSD}
      onAuxiliaryChange={handleNumericInput(updateSellUSD!)}
      hasError={false}
    />
  )
}

function DepositTokenInput({
  maxDepositAmount,
  maxDepositAmountUSD,
  vault: { token },
  priceInfo: { currentCollateralPrice },
  depositAmount,
  depositAmountUSD,
  updateDepositAmount,
  updateDepositAmountUSD,
  updateDepositAmountMax,
}: ManageMultiplyVaultState) {
  return (
    <VaultActionInput
      action="Deposit"
      token={token}
      tokenUsdPrice={currentCollateralPrice}
      showMax={true}
      hasAuxiliary={true}
      onSetMax={updateDepositAmountMax!}
      maxAmountLabel={'Max'}
      amount={depositAmount}
      auxiliaryAmount={depositAmountUSD}
      maxAmount={maxDepositAmount}
      maxAuxiliaryAmount={maxDepositAmountUSD}
      onChange={handleNumericInput(updateDepositAmount!)}
      onAuxiliaryChange={handleNumericInput(updateDepositAmountUSD!)}
      hasError={false}
    />
  )
}

function WithdrawTokenInput({
  maxWithdrawAmount,
  maxWithdrawAmountUSD,
  vault: { token },
  priceInfo: { currentCollateralPrice },
  withdrawAmount,
  withdrawAmountUSD,
  updateWithdrawAmount,
  updateWithdrawAmountUSD,
  updateWithdrawAmountMax,
}: ManageMultiplyVaultState) {
  return (
    <VaultActionInput
      action="Withdraw"
      token={token}
      tokenUsdPrice={currentCollateralPrice}
      showMax={true}
      hasAuxiliary={true}
      onSetMax={updateWithdrawAmountMax!}
      maxAmountLabel={'Max'}
      amount={withdrawAmount}
      auxiliaryAmount={withdrawAmountUSD}
      maxAmount={maxWithdrawAmount}
      maxAuxiliaryAmount={maxWithdrawAmountUSD}
      onChange={handleNumericInput(updateWithdrawAmount!)}
      onAuxiliaryChange={handleNumericInput(updateWithdrawAmountUSD!)}
      hasError={false}
    />
  )
}

function PaybackInput({
  paybackAmount,
  updatePaybackAmount,
  updatePaybackAmountMax,
  maxPaybackAmount,
}: ManageMultiplyVaultState) {
  return (
    <VaultActionInput
      action="Deposit"
      amount={paybackAmount}
      token="DAI"
      showMax={true}
      maxAmount={maxPaybackAmount}
      maxAmountLabel={'Max'}
      onSetMax={updatePaybackAmountMax}
      onChange={handleNumericInput(updatePaybackAmount!)}
      hasError={false}
    />
  )
}

function GenerateInput({
  generateAmount,
  updateGenerateAmount,
  updateGenerateAmountMax,
  maxGenerateAmount,
}: ManageMultiplyVaultState) {
  return (
    <VaultActionInput
      action="Withdraw"
      amount={generateAmount}
      token="DAI"
      showMax={true}
      maxAmount={maxGenerateAmount}
      maxAmountLabel={'Max'}
      onSetMax={updateGenerateAmountMax}
      onChange={handleNumericInput(updateGenerateAmount!)}
      hasError={false}
    />
  )
}

function SliderInput(props: ManageMultiplyVaultState & { collapsed?: boolean }) {
  const {
    theme: { colors },
  } = useThemeUI()

  const {
    vault: { collateralizationRatio },
    afterCollateralizationRatio,
    afterLiquidationPrice,
    ilkData: { liquidationRatio },
    requiredCollRatio,
    updateRequiredCollRatio,
    maxCollRatio,
    collapsed,
    multiply,
    hasToDepositCollateralOnEmptyVault,
  } = props

  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const sliderValue = requiredCollRatio || collateralizationRatio || maxCollRatio
  const slider = new BigNumber(100).minus(
    sliderValue.minus(liquidationRatio).div(maxCollRatio.minus(liquidationRatio)).times(100) ||
      zero,
  )

  const sliderBackground =
    multiply && !multiply.isNaN() && slider
      ? `linear-gradient(to right, ${colors?.sliderTrackFill} 0%, ${colors?.sliderTrackFill} ${
          slider.toNumber() || 0
        }%, ${colors?.primaryAlt} ${slider.toNumber() || 0}%, ${colors?.primaryAlt} 100%)`
      : 'primaryAlt'

  return (
    <Grid
      gap={2}
      sx={{
        variant: collapsed ? 'styles.collapsedContentContainer' : '',
      }}
    >
      <Box>
        <Flex
          sx={{
            variant: 'text.paragraph4',
            justifyContent: 'space-between',
            fontWeight: 'semiBold',
            color: 'text.subtitle',
          }}
        >
          <Grid gap={2}>
            <Text>Liquidation Price</Text>
            <Text variant="paragraph1" sx={{ fontWeight: 'semiBold' }}>
              ${formatFiatBalance(afterLiquidationPrice)}
            </Text>
          </Grid>
          <Grid gap={2}>
            <Text>Collateral Ratio</Text>
            <Text
              variant="paragraph1"
              sx={{ fontWeight: 'semiBold', textAlign: 'right', color: collRatioColor }}
            >
              {formatPercent(afterCollateralizationRatio.times(100))}
            </Text>
          </Grid>
        </Flex>
      </Box>
      <Box my={1}>
        <Slider
          sx={{
            background: sliderBackground,
            direction: 'rtl',
          }}
          disabled={hasToDepositCollateralOnEmptyVault}
          step={5}
          min={liquidationRatio.times(100).toNumber()}
          max={MAX_COLL_RATIO.times(100).toNumber()}
          value={
            requiredCollRatio?.times(100).toNumber() || collateralizationRatio.times(100).toNumber()
          }
          onChange={(e) => {
            updateRequiredCollRatio!(new BigNumber(e.target.value).div(100))
          }}
        />
      </Box>
      <Box>
        <Flex
          sx={{
            variant: 'text.paragraph4',
            justifyContent: 'space-between',
            color: 'text.subtitle',
          }}
        >
          <Text>Decrease risk</Text>
          <Text>Increase risk</Text>
        </Flex>
      </Box>
    </Grid>
  )
}

function AdjustPositionForm(props: ManageMultiplyVaultState) {
  const {
    vault: { token },
    showSliderController,
    toggleSliderController,
    mainAction,
    setMainAction,
  } = props

  if (showSliderController) {
    return (
      <>
        <SliderInput {...props} />
        {/* TO BE RESTORED */}
        {/* <Button sx={{ py: 2 }} variant="actionOption" onClick={toggleSliderController!}>
          <Text pr={1}>Or enter an amount of ETH</Text>
        </Button> */}
      </>
    )
  }

  return (
    <Box>
      <Flex>
        <Button
          onClick={() => setMainAction!('buy')}
          variant={mainAction === 'buy' ? 'beanActive' : 'bean'}
          sx={{ mr: 2 }}
        >
          Buy {token}
        </Button>
        <Button
          onClick={() => setMainAction!('sell')}
          variant={mainAction === 'sell' ? 'beanActive' : 'bean'}
        >
          Sell {token}
        </Button>
      </Flex>
      <Box mt={3} pb={2}>
        {mainAction === 'buy' ? <BuyTokenInput {...props} /> : <SellTokenInput {...props} />}
      </Box>
      <Button sx={{ py: 2 }} variant="actionOption" mt={3} onClick={toggleSliderController!}>
        <Text pr={1}>Or use the risk slider</Text>
      </Button>
    </Box>
  )
}

const OTHER_ACTIONS_OPTIONS: { value: OtherAction; label: string }[] = [
  { value: 'depositCollateral', label: 'Deposit Collateral' },
  { value: 'depositDai', label: 'Deposit Dai' },
  { value: 'withdrawCollateral', label: 'Withdraw Collateral' },
  { value: 'withdrawDai', label: 'Withdraw Dai' },
  { value: 'closeVault', label: 'Close Vault' },
]

function OtherActionsSelect(props: ManageMultiplyVaultState) {
  const { otherAction, setOtherAction } = props

  return (
    <ReactSelect
      options={OTHER_ACTIONS_OPTIONS}
      isSearchable={false}
      value={OTHER_ACTIONS_OPTIONS.find(({ value }) => value === otherAction)}
      // @ts-ignore
      onChange={({ value }) => setOtherAction!(value)}
      components={{
        IndicatorsContainer: () => null,
        ValueContainer: ({ children }) => <Flex sx={{ color: 'primary' }}>{children}</Flex>,
        SingleValue: ({ children }) => <Box>{children}</Box>,
        Option: ({ children, innerProps }) => (
          <Box
            {...innerProps}
            sx={{
              py: 2,
              px: 3,
              fontSize: 2,
              cursor: 'pointer',
              '&:hover': {
                bg: 'backgroundAlt',
              },
            }}
          >
            {children}
          </Box>
        ),
        Menu: ({ innerProps, children }) => (
          <Card
            {...innerProps}
            sx={{
              position: 'absolute',
              borderRadius: 'mediumLarge',
              p: 0,
              py: 2,
              overflow: 'hidden',
              bottom: 0,
              transform: `translateY(calc(100% + 8px))`,
              boxShadow: 'cardLanding',
              left: 0,
              width: '100%',
              zIndex: 1,
            }}
          >
            {children}
          </Card>
        ),
        MenuList: ({ children }) => <Box sx={{ textAlign: 'left' }}>{children}</Box>,
        Control: ({ innerProps, children, selectProps: { menuIsOpen } }) => (
          <Box
            {...innerProps}
            sx={{
              variant: 'cards.primary',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 2,
              borderRadius: 'mediumLarge',
              fontWeight: 'semiBold',
              mb: 2,
            }}
          >
            {children}
            <Icon
              name={menuIsOpen ? 'chevron_up' : 'chevron_down'}
              size="auto"
              width="14px"
              height="9px"
              sx={{ ml: 1, position: 'relative', top: '1px', color: 'text.subtitle' }}
            />
          </Box>
        ),
      }}
    />
  )
}

function CloseVaultCard({
  text,
  icon,
  onClick,
  isActive,
}: {
  text: string
  icon: string
  onClick: () => void
  isActive: boolean
}) {
  return (
    <Card
      sx={{
        borderRadius: 'mediumLarge',
        fontWeight: 'semiBold',
        fontSize: 2,
        py: 4,
        cursor: 'pointer',
        ...(isActive
          ? {
              boxShadow: 'actionCard',
              border: '1px solid',
              borderColor: 'borderSelected',
            }
          : {}),
      }}
      onClick={onClick}
    >
      <Flex sx={{ alignItems: 'center', px: 2, lineHeight: 2 }}>
        <Icon name={icon} size="auto" width="26px" height="26px" sx={{ mr: 2 }} />
        <Text ml={1}>{text}</Text>
      </Flex>
    </Card>
  )
}

// @ts-ignore
function CloseVaultAction(props: ManageMultiplyVaultState) {
  const {
    setCloseVaultTo,
    closeVaultTo,
    vault: { token },
    afterCloseToDai,
    afterCloseToCollateral,
    afterCloseToCollateralUSD,
  } = props

  const closeToCollateral = closeVaultTo === 'collateral'
  const closeToTokenName = closeToCollateral ? token : 'DAI'
  const tokenData = getToken(token)

  return (
    <>
      <Grid columns={2}>
        <CloseVaultCard
          text={`Close to ${token}`}
          icon={tokenData.iconCircle}
          onClick={() => setCloseVaultTo!('collateral')}
          isActive={closeToCollateral}
        />
        <CloseVaultCard
          text="Close to DAI"
          icon="dai_circle_color"
          onClick={() => setCloseVaultTo!('dai')}
          isActive={!closeToCollateral}
        />
      </Grid>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', mt: 3 }}>
        To close your vault, a part of your position will be sold to payback the outstanding debt.
        The rest of your collateral will be send to your address.
      </Text>
      <Flex sx={{ fontSize: 1, fontWeight: 'semiBold', justifyContent: 'space-between', mt: 3 }}>
        <Text sx={{ color: 'text.subtitle' }}>{closeToTokenName} after closing</Text>
        <Text>
          {formatCryptoBalance(closeToCollateral ? afterCloseToCollateral : afterCloseToDai)}{' '}
          {closeToTokenName}
          {` `}
          {closeToCollateral && (
            <Text as="span" sx={{ color: 'text.subtitle' }}>
              (${formatAmount(afterCloseToCollateralUSD, 'USD')})
            </Text>
          )}
        </Text>
      </Flex>
    </>
  )
}

function DepositCollateralAction(props: ManageMultiplyVaultState) {
  // const { showSliderController, toggleSliderController } = props

  return (
    <Grid gap={2}>
      <DepositTokenInput {...props} />
      {/* <Box>
        <Button
          variant={`actionOption${showSliderController ? 'Opened' : ''}`}
          mt={3}
          onClick={() => {
            toggleSliderController!()
          }}
        >
          {showSliderController ? <MinusIcon /> : <PlusIcon />}
          <Text pr={1}>Increase multiply with this transaction</Text>
        </Button>

        {showSliderController && (
          <Box>
            <SliderInput {...props} collapsed={true} />
          </Box>
        )}
      </Box> */}
    </Grid>
  )
}

function WithdrawCollateralAction(props: ManageMultiplyVaultState) {
  // const { showSliderController, toggleSliderController } = props

  return (
    <Grid gap={2}>
      <WithdrawTokenInput {...props} />
      {/* <Box>
        <Button
          variant={`actionOption${showSliderController ? 'Opened' : ''}`}
          mt={3}
          onClick={() => {
            toggleSliderController!()
          }}
        >
          {showSliderController ? <MinusIcon /> : <PlusIcon />}
          <Text pr={1}>Decrease multiply with this transaction</Text>
        </Button>

        {showSliderController && (
          <Box>
            <SliderInput {...props} collapsed={true} />
          </Box>
        )}
      </Box> */}
    </Grid>
  )
}

function DepositDAIAction(props: ManageMultiplyVaultState) {
  // const { showSliderController, toggleSliderController } = props

  return (
    <Grid gap={2}>
      <PaybackInput {...props} />
      {/* <Box>
        <Button
          variant={`actionOption${showSliderController ? 'Opened' : ''}`}
          mt={3}
          onClick={() => {
            toggleSliderController!()
          }}
        >
          {showSliderController ? <MinusIcon /> : <PlusIcon />}
          <Text pr={1}>Increase multiply with this transaction</Text>
        </Button>

        {showSliderController && (
          <Box>
            <SliderInput {...props} collapsed={true} />
          </Box>
        )}
      </Box> */}
    </Grid>
  )
}

function WithdrawDAIAction(props: ManageMultiplyVaultState) {
  // const { showSliderController, toggleSliderController } = props

  return (
    <Grid gap={2}>
      <GenerateInput {...props} />
      {/* <Box>
        <Button
          variant={`actionOption${showSliderController ? 'Opened' : ''}`}
          mt={3}
          onClick={() => {
            toggleSliderController!()
          }}
        >
          {showSliderController ? <MinusIcon /> : <PlusIcon />}
          <Text pr={1}>Decrease multiply with this transaction</Text>
        </Button>

        {showSliderController && (
          <Box>
            <SliderInput {...props} collapsed={true} />
          </Box>
        )}
      </Box> */}
    </Grid>
  )
}

function OtherActionsForm(props: ManageMultiplyVaultState) {
  const { otherAction } = props

  return (
    <Grid>
      <OtherActionsSelect {...props} />
      {otherAction === 'closeVault' && <CloseVaultAction {...props} />}
      {otherAction === 'depositCollateral' && <DepositCollateralAction {...props} />}
      {otherAction === 'withdrawCollateral' && <WithdrawCollateralAction {...props} />}
      {otherAction === 'depositDai' && <DepositDAIAction {...props} />}
      {otherAction === 'withdrawDai' && <WithdrawDAIAction {...props} />}
    </Grid>
  )
}

export function ManageMultiplyVaultEditing(props: ManageMultiplyVaultState) {
  const { stage, inputAmountsEmpty } = props

  return (
    <Grid gap={4}>
      {stage === 'adjustPosition' && <AdjustPositionForm {...props} />}
      {stage === 'otherActions' && <OtherActionsForm {...props} />}
      {!inputAmountsEmpty && <Divider />}
      <ManageMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
