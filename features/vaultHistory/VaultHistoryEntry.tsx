import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { DefinitionList, DefinitionListItem } from 'components/DefinitionList'
import { AppLink } from 'components/Links'
import { VaultChangesInformationArrow } from 'components/vault/VaultChangesInformation'
import { WithArrow } from 'components/WithArrow'
import dayjs from 'dayjs'
import { maxUint32, maxUint256 } from 'features/automation/common/consts'
import { calculateMultipleFromTargetCollRatio } from 'features/automation/common/helpers/calculateMultipleFromTargetCollRatio'
import type { AutomationEvent } from 'features/vaultHistory/vaultHistoryEvents.types'
import {
  formatAddress,
  formatAmount,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { interpolate } from 'helpers/interpolate'
import type { WithChildren } from 'helpers/types/With.types'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'
import type { TranslationType } from 'ts_modules/i18next'

import type { VaultHistoryEvent } from './vaultHistory.types'
import type { AutomationEntryProps } from './VaultHistoryEntry.types'

function resolveTranslationForEventsWithTriggers(event: AutomationEvent) {
  const isGroup = 'groupId' in event && event.groupId
  const isExecutionEvent = event.eventType === 'executed'

  if (isGroup) {
    switch (event.autoKind) {
      case 'basic-sell':
        return isExecutionEvent ? 'constant-multiple-sell' : 'constant-multiple'
      case 'basic-buy':
        return isExecutionEvent ? 'constant-multiple-buy' : 'constant-multiple'
      default:
        return 'constant-multiple'
    }
  }

  return event.autoKind
}

export function getHistoryEventTranslation(t: TranslationType, event: VaultHistoryEvent) {
  if ('triggerId' in event) {
    const resolveKind = resolveTranslationForEventsWithTriggers(event)

    return `${t(`history.${resolveKind}`)} ${t(`triggers.${event.eventType}`)}`
  }

  return t(`history.${event.kind.toLowerCase()}`, {
    transferTo: 'transferTo' in event && formatAddress(event.transferTo),
    transferFrom: 'transferFrom' in event && formatAddress(event.transferFrom),
    collateralAmount:
      'collateralAmount' in event && event.collateralAmount
        ? formatCryptoBalance(event.collateralAmount.abs())
        : 0,
    daiAmount:
      'daiAmount' in event
        ? formatCryptoBalance((event.daiAmount && event.daiAmount.abs()) || zero)
        : 0,
    remainingCollateral:
      'remainingCollateral' in event && event.remainingCollateral
        ? formatCryptoBalance(event.remainingCollateral)
        : 0,
    collateralTaken:
      'collateralTaken' in event && event.collateralTaken
        ? formatCryptoBalance(event.collateralTaken)
        : 0,
    coveredDebt:
      'coveredDebt' in event && event.coveredDebt ? formatCryptoBalance(event.coveredDebt) : 0,
    cdpId: 'cdpId' in event ? event.cdpId : undefined,
    auctionId: 'auctionId' in event ? event.auctionId : undefined,
    token: event.token,
  })
}

function VaultHistoryEntryDetailsItem({ label, children }: { label: string } & WithChildren) {
  return (
    <DefinitionListItem sx={{ display: 'flex', justifyContent: 'space-between', pl: 3, pr: 2 }}>
      <Text
        as="span"
        sx={{
          color: 'neutral80',
          pr: 2,
        }}
      >
        {label}
      </Text>
      <Text
        as="span"
        sx={{
          flexShrink: 0,
          color: 'primary100',
        }}
      >
        {children}
      </Text>
    </DefinitionListItem>
  )
}

function resolveMaxBuyOrSellPrice(maxBuyOrMinSellPrice: BigNumber, unlimited: string) {
  return maxBuyOrMinSellPrice.isEqualTo(maxUint256) || maxBuyOrMinSellPrice.isZero()
    ? unlimited
    : '$' + formatFiatBalance(maxBuyOrMinSellPrice)
}

function resolveMaxGweiAmount(maxBaseFeeInGwei: BigNumber, unlimited: string) {
  return maxBaseFeeInGwei.isEqualTo(maxUint32)
    ? unlimited
    : formatCryptoBalance(maxBaseFeeInGwei) + ' Gwei'
}

function StandaloneAutomationEntry({
  event,
  isAddOrRemoveEvent,
  isUpdateEvent,
  addOrRemoveTriggersData,
}: AutomationEntryProps) {
  const { t } = useTranslation()

  const isStopLossEvent = event.kind === 'stop-loss'
  const isAutoTakeProfitEvent = event.kind === 'auto-take-profit'
  const isAutoBSEvent = event.kind === 'basic-buy' || event.kind === 'basic-sell'
  const maxBuyOrMinSellPriceLabel =
    event.kind === 'basic-sell' ? t('history.minimum-sell-price') : t('history.maximum-buy-price')
  const unlimited = t('unlimited')

  return (
    <>
      {isAddOrRemoveEvent && (
        <>
          {isAutoBSEvent && 'execCollRatio' in addOrRemoveTriggersData[0] && (
            <DefinitionList>
              <VaultHistoryEntryDetailsItem label={t('history.trigger-col-ratio')}>
                {formatPercent(addOrRemoveTriggersData[0].execCollRatio, {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
              </VaultHistoryEntryDetailsItem>
              <VaultHistoryEntryDetailsItem label={t('history.target-col-ratio')}>
                {formatPercent(addOrRemoveTriggersData[0].targetCollRatio, {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
              </VaultHistoryEntryDetailsItem>
              <VaultHistoryEntryDetailsItem label={maxBuyOrMinSellPriceLabel}>
                {resolveMaxBuyOrSellPrice(
                  addOrRemoveTriggersData[0].maxBuyOrMinSellPrice,
                  unlimited,
                )}
              </VaultHistoryEntryDetailsItem>
              <VaultHistoryEntryDetailsItem label={t('history.max-gas-fee-in-gwei')}>
                {resolveMaxGweiAmount(addOrRemoveTriggersData[0].maxBaseFeeInGwei, unlimited)}
              </VaultHistoryEntryDetailsItem>
            </DefinitionList>
          )}
          {isStopLossEvent && 'stopLossLevel' in addOrRemoveTriggersData[0] && (
            <DefinitionList>
              <VaultHistoryEntryDetailsItem label={t('history.trigger-col-ratio')}>
                {formatPercent(addOrRemoveTriggersData[0].stopLossLevel.times(100), {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
              </VaultHistoryEntryDetailsItem>
              <VaultHistoryEntryDetailsItem label={t('history.close-to')}>
                {addOrRemoveTriggersData[0].isToCollateral
                  ? (event as AutomationEvent).token
                  : 'Dai'}
              </VaultHistoryEntryDetailsItem>
            </DefinitionList>
          )}
          {isAutoTakeProfitEvent && 'executionPrice' in addOrRemoveTriggersData[0] && (
            <DefinitionList>
              <VaultHistoryEntryDetailsItem label={t('history.trigger-price')}>
                ${formatAmount(addOrRemoveTriggersData[0].executionPrice, 'USD')}
              </VaultHistoryEntryDetailsItem>
              <VaultHistoryEntryDetailsItem label={t('history.close-to')}>
                {addOrRemoveTriggersData[0].isToCollateral
                  ? (event as AutomationEvent).token
                  : 'Dai'}
              </VaultHistoryEntryDetailsItem>
            </DefinitionList>
          )}
        </>
      )}
      {isUpdateEvent && (
        <>
          {isAutoBSEvent &&
            'execCollRatio' in event.removeTriggerData[0] &&
            'execCollRatio' in event.addTriggerData[0] && (
              <DefinitionList>
                <VaultHistoryEntryDetailsItem label={t('history.trigger-col-ratio')}>
                  {formatPercent(event.removeTriggerData[0].execCollRatio, {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}
                  <VaultChangesInformationArrow />
                  {formatPercent(event.addTriggerData[0].execCollRatio, {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}
                </VaultHistoryEntryDetailsItem>
                <VaultHistoryEntryDetailsItem label={t('history.target-col-ratio')}>
                  {formatPercent(event.removeTriggerData[0].targetCollRatio, {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}
                  <VaultChangesInformationArrow />
                  {formatPercent(event.addTriggerData[0].targetCollRatio, {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}
                </VaultHistoryEntryDetailsItem>
                <VaultHistoryEntryDetailsItem label={maxBuyOrMinSellPriceLabel}>
                  {resolveMaxBuyOrSellPrice(
                    event.removeTriggerData[0].maxBuyOrMinSellPrice,
                    unlimited,
                  )}
                  <VaultChangesInformationArrow />
                  {resolveMaxBuyOrSellPrice(
                    event.addTriggerData[0].maxBuyOrMinSellPrice,
                    unlimited,
                  )}
                </VaultHistoryEntryDetailsItem>
                <VaultHistoryEntryDetailsItem label={t('history.max-gas-fee-in-gwei')}>
                  {resolveMaxGweiAmount(event.removeTriggerData[0].maxBaseFeeInGwei, unlimited)}
                  <VaultChangesInformationArrow />
                  {resolveMaxGweiAmount(event.addTriggerData[0].maxBaseFeeInGwei, unlimited)}
                </VaultHistoryEntryDetailsItem>
              </DefinitionList>
            )}
          {isStopLossEvent &&
            'stopLossLevel' in event.removeTriggerData[0] &&
            'stopLossLevel' in event.addTriggerData[0] && (
              <DefinitionList>
                <VaultHistoryEntryDetailsItem label={t('history.trigger-col-ratio')}>
                  {formatPercent(event.removeTriggerData[0].stopLossLevel.times(100), {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}
                  <VaultChangesInformationArrow />
                  {formatPercent(event.addTriggerData[0].stopLossLevel.times(100), {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}
                </VaultHistoryEntryDetailsItem>
                <VaultHistoryEntryDetailsItem label={t('history.close-to')}>
                  {event.removeTriggerData[0].isToCollateral ? event.token : 'Dai'}
                  <VaultChangesInformationArrow />
                  {event.addTriggerData[0].isToCollateral ? event.token : 'Dai'}
                </VaultHistoryEntryDetailsItem>
              </DefinitionList>
            )}
          {isAutoTakeProfitEvent &&
            'executionPrice' in event.removeTriggerData[0] &&
            'executionPrice' in event.addTriggerData[0] && (
              <DefinitionList>
                <VaultHistoryEntryDetailsItem label={t('history.trigger-price')}>
                  ${formatAmount(event.removeTriggerData[0].executionPrice, 'USD')}
                  <VaultChangesInformationArrow />$
                  {formatAmount(event.addTriggerData[0].executionPrice, 'USD')}
                </VaultHistoryEntryDetailsItem>
                <VaultHistoryEntryDetailsItem label={t('history.close-to')}>
                  {event.removeTriggerData[0].isToCollateral ? event.token : 'Dai'}
                  <VaultChangesInformationArrow />
                  {event.addTriggerData[0].isToCollateral ? event.token : 'Dai'}
                </VaultHistoryEntryDetailsItem>
              </DefinitionList>
            )}
        </>
      )}
    </>
  )
}

function GroupAutomationEntry({
  event,
  isAddOrRemoveEvent,
  isUpdateEvent,
  addOrRemoveTriggersData,
}: AutomationEntryProps) {
  const { t } = useTranslation()

  const unlimited = t('unlimited')

  return (
    <>
      {isAddOrRemoveEvent &&
        'execCollRatio' in addOrRemoveTriggersData[0] &&
        'execCollRatio' in addOrRemoveTriggersData[1] && (
          <DefinitionList>
            <VaultHistoryEntryDetailsItem label={t('history.buy-trigger-col-ratio')}>
              {formatPercent(addOrRemoveTriggersData[1].execCollRatio, {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </VaultHistoryEntryDetailsItem>
            <VaultHistoryEntryDetailsItem label={t('history.maximum-buy-price')}>
              {resolveMaxBuyOrSellPrice(addOrRemoveTriggersData[1].maxBuyOrMinSellPrice, unlimited)}
            </VaultHistoryEntryDetailsItem>
            <VaultHistoryEntryDetailsItem label={t('history.sell-trigger-col-ratio')}>
              {formatPercent(addOrRemoveTriggersData[0].execCollRatio, {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </VaultHistoryEntryDetailsItem>
            <VaultHistoryEntryDetailsItem label={t('history.minimum-sell-price')}>
              {resolveMaxBuyOrSellPrice(addOrRemoveTriggersData[0].maxBuyOrMinSellPrice, unlimited)}
            </VaultHistoryEntryDetailsItem>
            <VaultHistoryEntryDetailsItem label={t('history.target-col-ratio')}>
              {formatPercent(addOrRemoveTriggersData[0].targetCollRatio, {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </VaultHistoryEntryDetailsItem>
            <VaultHistoryEntryDetailsItem label={t('history.target-multiple')}>
              {calculateMultipleFromTargetCollRatio(
                addOrRemoveTriggersData[0].targetCollRatio,
              ).toFixed(2)}
              x
            </VaultHistoryEntryDetailsItem>
            <VaultHistoryEntryDetailsItem label={t('history.max-gas-fee-in-gwei')}>
              {resolveMaxGweiAmount(addOrRemoveTriggersData[0].maxBaseFeeInGwei, unlimited)}
            </VaultHistoryEntryDetailsItem>
          </DefinitionList>
        )}
      {isUpdateEvent &&
        'execCollRatio' in event.removeTriggerData[0] &&
        'execCollRatio' in event.removeTriggerData[1] &&
        'execCollRatio' in event.addTriggerData[0] &&
        'execCollRatio' in event.addTriggerData[1] && (
          <DefinitionList>
            <VaultHistoryEntryDetailsItem label={t('history.buy-trigger-col-ratio')}>
              {formatPercent(event.removeTriggerData[1].execCollRatio, {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
              <VaultChangesInformationArrow />
              {formatPercent(event.addTriggerData[1].execCollRatio, {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </VaultHistoryEntryDetailsItem>
            <VaultHistoryEntryDetailsItem label={t('history.maximum-buy-price')}>
              {resolveMaxBuyOrSellPrice(event.removeTriggerData[1].maxBuyOrMinSellPrice, unlimited)}
              <VaultChangesInformationArrow />
              {resolveMaxBuyOrSellPrice(event.addTriggerData[1].maxBuyOrMinSellPrice, unlimited)}
            </VaultHistoryEntryDetailsItem>
            <VaultHistoryEntryDetailsItem label={t('history.sell-trigger-col-ratio')}>
              {formatPercent(event.removeTriggerData[0].execCollRatio, {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
              <VaultChangesInformationArrow />
              {formatPercent(event.addTriggerData[0].execCollRatio, {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </VaultHistoryEntryDetailsItem>
            <VaultHistoryEntryDetailsItem label={t('history.minimum-sell-price')}>
              {resolveMaxBuyOrSellPrice(event.removeTriggerData[0].maxBuyOrMinSellPrice, unlimited)}
              <VaultChangesInformationArrow />
              {resolveMaxBuyOrSellPrice(event.addTriggerData[0].maxBuyOrMinSellPrice, unlimited)}
            </VaultHistoryEntryDetailsItem>
            <VaultHistoryEntryDetailsItem label={t('history.target-col-ratio')}>
              {formatPercent(event.removeTriggerData[0].targetCollRatio, {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
              <VaultChangesInformationArrow />
              {formatPercent(event.addTriggerData[0].targetCollRatio, {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </VaultHistoryEntryDetailsItem>
            <VaultHistoryEntryDetailsItem label={t('history.target-multiple')}>
              {calculateMultipleFromTargetCollRatio(
                event.removeTriggerData[0].targetCollRatio,
              ).toFixed(2)}
              x
              <VaultChangesInformationArrow />
              {calculateMultipleFromTargetCollRatio(
                event.addTriggerData[0].targetCollRatio,
              ).toFixed(2)}
              x
            </VaultHistoryEntryDetailsItem>
            <VaultHistoryEntryDetailsItem label={t('history.max-gas-fee-in-gwei')}>
              {resolveMaxGweiAmount(event.removeTriggerData[0].maxBaseFeeInGwei, unlimited)}
              <VaultChangesInformationArrow />
              {resolveMaxGweiAmount(event.addTriggerData[0].maxBaseFeeInGwei, unlimited)}
            </VaultHistoryEntryDetailsItem>
          </DefinitionList>
        )}
    </>
  )
}

function VaultHistoryAutomationEntryDetails(event: AutomationEvent) {
  const isUpdateEvent = 'addTriggerData' in event && 'removeTriggerData' in event
  const isAddOrRemoveEvent =
    ('addTriggerData' in event || 'removeTriggerData' in event) && !isUpdateEvent
  const addOrRemoveKey =
    isAddOrRemoveEvent && 'addTriggerData' in event ? 'addTriggerData' : 'removeTriggerData'

  const isGroupEntry = !!('groupId' in event && event.groupId)

  const addOrRemoveTriggersData = event[addOrRemoveKey]

  return isGroupEntry ? (
    <GroupAutomationEntry
      event={event}
      isAddOrRemoveEvent={isAddOrRemoveEvent}
      isUpdateEvent={isUpdateEvent}
      addOrRemoveTriggersData={addOrRemoveTriggersData}
    />
  ) : (
    <StandaloneAutomationEntry
      event={event}
      isAddOrRemoveEvent={isAddOrRemoveEvent}
      isUpdateEvent={isUpdateEvent}
      addOrRemoveTriggersData={addOrRemoveTriggersData}
    />
  )
}

function VaultHistoryEntryDetails(event: VaultHistoryEvent) {
  const { t } = useTranslation()
  const closeEvent =
    event.kind === 'CLOSE_VAULT_TO_DAI' ||
    event.kind === 'CLOSE_VAULT_TO_COLLATERAL' ||
    event.kind === 'CLOSE_GUNI_VAULT_TO_DAI'
  const guniVaultEvent = event.token.includes('GUNI')

  return (
    <DefinitionList>
      {event.kind === 'OPEN_MULTIPLY_VAULT' && (
        <>
          <VaultHistoryEntryDetailsItem label={t('history.deposited')}>
            {'depositCollateral' in event && formatCryptoBalance(event.depositCollateral)}{' '}
            {event.token}
          </VaultHistoryEntryDetailsItem>
          <VaultHistoryEntryDetailsItem label={t('history.bought')}>
            {'bought' in event && formatCryptoBalance(event.bought)} {event.token}
          </VaultHistoryEntryDetailsItem>
        </>
      )}
      {event.kind === 'OPEN_MULTIPLY_GUNI_VAULT' && (
        <>
          <VaultHistoryEntryDetailsItem label={t('history.deposited')}>
            {'depositDai' in event && formatCryptoBalance(event.depositDai)} DAI
          </VaultHistoryEntryDetailsItem>
        </>
      )}
      {event.kind === 'INCREASE_MULTIPLE' && (
        <VaultHistoryEntryDetailsItem label={t('history.bought')}>
          {'bought' in event && formatCryptoBalance(event.bought)} {event.token}
        </VaultHistoryEntryDetailsItem>
      )}
      {event.kind === 'INCREASE_MULTIPLE' && (
        <VaultHistoryEntryDetailsItem label={t('history.deposited')}>
          {'depositCollateral' in event && formatCryptoBalance(event.depositCollateral)}
          {event.token}
        </VaultHistoryEntryDetailsItem>
      )}
      {(event.kind === 'DECREASE_MULTIPLE' || closeEvent) && (
        <VaultHistoryEntryDetailsItem label={t('history.sold')}>
          {'sold' in event && formatCryptoBalance(event.sold)}{' '}
          {guniVaultEvent ? 'USDC' : event.token}
        </VaultHistoryEntryDetailsItem>
      )}
      {!(closeEvent && guniVaultEvent) && (
        <VaultHistoryEntryDetailsItem label={t('system.oracle-price')}>
          {'oraclePrice' in event && '$' + formatFiatBalance(event.oraclePrice!)}
        </VaultHistoryEntryDetailsItem>
      )}
      {event.kind !== 'OPEN_MULTIPLY_GUNI_VAULT' && (
        <VaultHistoryEntryDetailsItem label={t('system.market-price')}>
          {'marketPrice' in event && '$' + formatFiatBalance(event.marketPrice)}
        </VaultHistoryEntryDetailsItem>
      )}

      {!closeEvent && (
        <>
          <VaultHistoryEntryDetailsItem label={t('system.collateral')}>
            {'beforeLockedCollateral' in event && event.beforeLockedCollateral.gt(0) && (
              <>
                {formatCryptoBalance(event.beforeLockedCollateral)} <VaultChangesInformationArrow />
              </>
            )}
            {'lockedCollateral' in event && formatCryptoBalance(event.lockedCollateral)}{' '}
            {event.token}
          </VaultHistoryEntryDetailsItem>
          <VaultHistoryEntryDetailsItem label={t('multiple')}>
            {'beforeMultiple' in event && event.beforeMultiple.gt(0) && (
              <>
                {formatCryptoBalance(event.beforeMultiple) + `x`}
                <VaultChangesInformationArrow />
              </>
            )}
            {'multiple' in event && event.multiple.gt(zero) ? `${event.multiple.toFixed(2)}x` : '-'}
          </VaultHistoryEntryDetailsItem>
        </>
      )}
      {(event.kind === 'CLOSE_VAULT_TO_DAI' || event.kind === 'CLOSE_GUNI_VAULT_TO_DAI') && (
        <VaultHistoryEntryDetailsItem label={t('history.exit-dai')}>
          {'exitDai' in event && formatCryptoBalance(event.exitDai)} DAI
        </VaultHistoryEntryDetailsItem>
      )}
      {event.kind === 'CLOSE_VAULT_TO_COLLATERAL' && (
        <VaultHistoryEntryDetailsItem label={t('history.exit-collateral')}>
          {'exitCollateral' in event && formatCryptoBalance(event.exitCollateral)} {event.token}
        </VaultHistoryEntryDetailsItem>
      )}
      <VaultHistoryEntryDetailsItem label={t('outstanding-debt')}>
        {'beforeDebt' in event && event.beforeDebt.gt(0) && (
          <>
            {formatCryptoBalance(event.beforeDebt.times(event.rate)) + `DAI`}
            <VaultChangesInformationArrow />
          </>
        )}
        {'debt' in event && formatCryptoBalance(event.debt.times(event.rate))} DAI
      </VaultHistoryEntryDetailsItem>
      {!closeEvent && (
        <>
          {event.kind !== 'OPEN_MULTIPLY_GUNI_VAULT' && (
            <VaultHistoryEntryDetailsItem label={t('system.coll-ratio')}>
              {'beforeCollateralizationRatio' in event &&
                event.beforeCollateralizationRatio.gt(0) && (
                  <>
                    {formatPercent(event.beforeCollateralizationRatio.times(100), {
                      precision: 2,
                      roundMode: BigNumber.ROUND_DOWN,
                    })}
                    <VaultChangesInformationArrow />
                  </>
                )}
              {'collateralizationRatio' in event &&
                formatPercent(event.collateralizationRatio.times(100), {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
            </VaultHistoryEntryDetailsItem>
          )}
          <VaultHistoryEntryDetailsItem label={t('net-value')}>
            {'netValue' in event && '$' + formatFiatBalance(event.netValue)}
          </VaultHistoryEntryDetailsItem>
          {event.kind !== 'OPEN_MULTIPLY_GUNI_VAULT' && (
            <VaultHistoryEntryDetailsItem label={t('system.liquidation-price')}>
              {'beforeLiquidationPrice' in event && event.beforeLiquidationPrice.gt(0) && (
                <>
                  {`$` + formatFiatBalance(event.beforeLiquidationPrice)}
                  <VaultChangesInformationArrow />
                </>
              )}
              {'liquidationPrice' in event && '$' + formatFiatBalance(event.liquidationPrice)}
            </VaultHistoryEntryDetailsItem>
          )}
        </>
      )}
      <VaultHistoryEntryDetailsItem label={t('history.total-fees')}>
        {'totalFee' in event &&
        'gasFee' in event &&
        (event.totalFee.gt(zero) || event.gasFee.gt(zero))
          ? '$' +
            formatFiatBalance(
              BigNumber.sum(
                event.totalFee,
                amountFromWei(event.gasFee || zero, 'ETH').times(event.ethPrice),
              ),
            )
          : '-'}
      </VaultHistoryEntryDetailsItem>
    </DefinitionList>
  )
}

export function VaultHistoryEntry({
  item,
  etherscan,
  ethtx,
}: {
  item: VaultHistoryEvent
  etherscan?: { url: string }
  ethtx?: { url: string }
}) {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const translation = getHistoryEventTranslation(t, item)
  const date = dayjs(item.timestamp)

  const isMultiplyEvent =
    item.kind === 'OPEN_MULTIPLY_VAULT' ||
    item.kind === 'OPEN_MULTIPLY_GUNI_VAULT' ||
    item.kind === 'INCREASE_MULTIPLE' ||
    item.kind === 'DECREASE_MULTIPLE' ||
    item.kind === 'CLOSE_VAULT_TO_DAI' ||
    item.kind === 'CLOSE_GUNI_VAULT_TO_DAI' ||
    item.kind === 'CLOSE_VAULT_TO_COLLATERAL'

  const isAutomationEvent = 'triggerId' in item

  return (
    <DefinitionListItem sx={{ fontSize: 2, position: 'relative' }}>
      <Flex
        sx={{
          flexDirection: ['column', null, null, 'row'],
          justifyContent: 'space-between',
          alignItems: ['flex-start', null, null, 'center'],
          width: '100%',
          pb: opened ? 3 : 0,
          pl: 2,
          pr: 4,
          fontSize: 2,
          cursor: 'pointer',
        }}
        onClick={() => setOpened(!opened)}
      >
        <Text as="p" sx={{ fontWeight: 'semiBold', color: 'primary100' }}>
          {interpolate(translation, {
            0: ({ children }) => <Text as="span">{children}</Text>,
          })}
        </Text>
        <Text as="time" sx={{ color: 'neutral80', whiteSpace: 'nowrap', fontWeight: 'semiBold' }}>
          {date.format('MMM DD, YYYY, h:mma')}
        </Text>
        <Icon
          name={`chevron_${opened ? 'up' : 'down'}`}
          size="auto"
          width="12px"
          height="7px"
          color="neutral80"
          sx={{ position: 'absolute', top: '24px', right: 2 }}
        />
      </Flex>
      {opened && (
        <Box sx={{ pb: 3 }}>
          {isMultiplyEvent && <VaultHistoryEntryDetails {...item} />}
          {isAutomationEvent && <VaultHistoryAutomationEntryDetails {...item} />}
          <Flex
            sx={{
              flexDirection: ['column', null, null, 'row'],
              pr: 2,
              pt: 3,
              pl: 3,
            }}
          >
            <AppLink sx={{ textDecoration: 'none' }} href={`${etherscan?.url}/tx/${item.hash}`}>
              <WithArrow
                sx={{
                  color: 'interactive100',
                  mr: 4,
                  mb: [1, null, null, 0],
                  fontSize: 1,
                  fontWeight: 'semiBold',
                }}
              >
                {t('view-on-etherscan')}
              </WithArrow>
            </AppLink>
            {ethtx && (
              <AppLink sx={{ textDecoration: 'none' }} href={`${ethtx.url}/${item.hash}`}>
                <WithArrow sx={{ color: 'interactive100', fontSize: 1, fontWeight: 'semiBold' }}>
                  {t('view-on-ethtx')}
                </WithArrow>
              </AppLink>
            )}
          </Flex>
        </Box>
      )}
    </DefinitionListItem>
  )
}
