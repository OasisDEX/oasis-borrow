import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { DefinitionList, DefinitionListItem } from 'components/DefinitionList'
import { AppLink } from 'components/Links'
import { VaultChangesInformationArrow } from 'components/vault/VaultChangesInformation'
import { WithArrow } from 'components/WithArrow'
import { maxUint32, maxUint256 } from 'features/automation/common/basicBSTriggerData'
import { AutomationEvent } from 'features/vaultHistory/vaultHistoryEvents'
import {
  formatAddress,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { interpolate } from 'helpers/interpolate'
import { WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import moment from 'moment'
import { TFunction, useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'

import { VaultHistoryEvent } from './vaultHistory'

function resolveTranslationForEventsWithTriggers(event: VaultHistoryEvent) {
  switch (event.kind) {
    case 'DECREASE_MULTIPLE':
      return 'basic-sell'
    case 'INCREASE_MULTIPLE':
      return 'basic-buy'
    case 'CLOSE_VAULT_TO_DAI':
    case 'CLOSE_VAULT_TO_COLLATERAL':
      return 'stop-loss'
    default:
      return event.kind
  }
}

export function getHistoryEventTranslation(t: TFunction, event: VaultHistoryEvent) {
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
    daiAmount: 'daiAmount' in event ? formatCryptoBalance(event.daiAmount.abs()) : 0,
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

function VaultHistoryAutomationEntryDetails(event: AutomationEvent) {
  const { t } = useTranslation()

  const isUpdateEvent = 'addTriggerData' in event && 'removeTriggerData' in event
  const isAddOrRemoveEvent =
    ('addTriggerData' in event || 'removeTriggerData' in event) && !isUpdateEvent
  const addOrRemoveKey =
    isAddOrRemoveEvent && 'addTriggerData' in event ? 'addTriggerData' : 'removeTriggerData'

  const isBasicBSEvent = event.kind === 'basic-buy' || event.kind === 'basic-sell'
  const isStopLossEvent = event.kind === 'stop-loss'

  const addOrRemoveEvent = event[addOrRemoveKey]
  const maxBuyOrMinSellPriceLabel =
    event.kind === 'basic-sell' ? t('history.minimum-sell-price') : t('history.maximum-buy-price')

  const unlimited = t('unlimited')

  return (
    <>
      {isAddOrRemoveEvent && (
        <>
          {isBasicBSEvent && 'execCollRatio' in addOrRemoveEvent && (
            <DefinitionList>
              <VaultHistoryEntryDetailsItem label={t('history.trigger-col-ratio')}>
                {formatPercent(addOrRemoveEvent.execCollRatio, {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
              </VaultHistoryEntryDetailsItem>
              <VaultHistoryEntryDetailsItem label={t('history.target-col-ratio')}>
                {formatPercent(addOrRemoveEvent.targetCollRatio, {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
              </VaultHistoryEntryDetailsItem>
              <VaultHistoryEntryDetailsItem label={maxBuyOrMinSellPriceLabel}>
                {resolveMaxBuyOrSellPrice(addOrRemoveEvent.maxBuyOrMinSellPrice, unlimited)}
              </VaultHistoryEntryDetailsItem>
              <VaultHistoryEntryDetailsItem label={t('history.max-gas-fee-in-gwei')}>
                {resolveMaxGweiAmount(addOrRemoveEvent.maxBaseFeeInGwei, unlimited)}
              </VaultHistoryEntryDetailsItem>
            </DefinitionList>
          )}
          {isStopLossEvent && 'stopLossLevel' in addOrRemoveEvent && (
            <DefinitionList>
              <VaultHistoryEntryDetailsItem label={t('history.trigger-col-ratio')}>
                {formatPercent(addOrRemoveEvent.stopLossLevel.times(100), {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
              </VaultHistoryEntryDetailsItem>
              <VaultHistoryEntryDetailsItem label={t('history.close-to')}>
                {addOrRemoveEvent.isToCollateral ? (event as AutomationEvent).token : 'Dai'}
              </VaultHistoryEntryDetailsItem>
            </DefinitionList>
          )}
        </>
      )}
      {isUpdateEvent && (
        <>
          {isBasicBSEvent &&
            'execCollRatio' in event.removeTriggerData &&
            'execCollRatio' in event.addTriggerData && (
              <DefinitionList>
                <VaultHistoryEntryDetailsItem label={t('history.trigger-col-ratio')}>
                  {formatPercent(event.removeTriggerData.execCollRatio, {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}
                  <VaultChangesInformationArrow />
                  {formatPercent(event.addTriggerData.execCollRatio, {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}
                </VaultHistoryEntryDetailsItem>
                <VaultHistoryEntryDetailsItem label={t('history.target-col-ratio')}>
                  {formatPercent(event.removeTriggerData.targetCollRatio, {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}
                  <VaultChangesInformationArrow />
                  {formatPercent(event.addTriggerData.targetCollRatio, {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}
                </VaultHistoryEntryDetailsItem>
                <VaultHistoryEntryDetailsItem label={maxBuyOrMinSellPriceLabel}>
                  {resolveMaxBuyOrSellPrice(
                    event.removeTriggerData.maxBuyOrMinSellPrice,
                    unlimited,
                  )}
                  <VaultChangesInformationArrow />
                  {resolveMaxBuyOrSellPrice(event.addTriggerData.maxBuyOrMinSellPrice, unlimited)}
                </VaultHistoryEntryDetailsItem>
                <VaultHistoryEntryDetailsItem label={t('history.max-gas-fee-in-gwei')}>
                  {resolveMaxGweiAmount(event.removeTriggerData.maxBaseFeeInGwei, unlimited)}
                  <VaultChangesInformationArrow />
                  {resolveMaxGweiAmount(event.addTriggerData.maxBaseFeeInGwei, unlimited)}
                </VaultHistoryEntryDetailsItem>
              </DefinitionList>
            )}
          {isStopLossEvent &&
            'stopLossLevel' in event.removeTriggerData &&
            'stopLossLevel' in event.addTriggerData && (
              <DefinitionList>
                <VaultHistoryEntryDetailsItem label={t('history.trigger-col-ratio')}>
                  {formatPercent(event.removeTriggerData.stopLossLevel.times(100), {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}
                  <VaultChangesInformationArrow />
                  {formatPercent(event.addTriggerData.stopLossLevel.times(100), {
                    precision: 2,
                    roundMode: BigNumber.ROUND_DOWN,
                  })}
                </VaultHistoryEntryDetailsItem>
                <VaultHistoryEntryDetailsItem label={t('history.close-to')}>
                  {event.removeTriggerData.isToCollateral ? event.token : 'Dai'}
                  <VaultChangesInformationArrow />
                  {event.addTriggerData.isToCollateral ? event.token : 'Dai'}
                </VaultHistoryEntryDetailsItem>
              </DefinitionList>
            )}
        </>
      )}
    </>
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
              {'beforeCollateralizationRatio' in event && event.beforeCollateralizationRatio.gt(0) && (
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
  const date = moment(item.timestamp)

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
