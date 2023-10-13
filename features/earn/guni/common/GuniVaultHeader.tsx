import type BigNumber from 'bignumber.js'
import { useProductContext } from 'components/context/ProductContextProvider'
import { EarnVaultHeadline } from 'components/vault/EarnVaultHeadline'
import type { HeadlineDetailsProp } from 'components/vault/VaultHeadlineDetails'
import dayjs from 'dayjs'
import type { FollowButtonControlProps } from 'features/follow/controllers/FollowButtonControl'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import type { YieldChange } from 'helpers/earn/calculations'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export interface EarnVaultHeaderProps {
  ilk: string
  token: string
  followButton?: FollowButtonControlProps
  shareButton?: boolean
}

const currentDate = dayjs().startOf('day')
const previousDate = currentDate.clone().subtract(1, 'day')

export function GuniVaultHeader({ ilk, token, followButton, shareButton }: EarnVaultHeaderProps) {
  const { yieldsChange$, totalValueLocked$ } = useProductContext()
  const [yieldChanges, changesError] = useObservable(yieldsChange$(currentDate, previousDate, ilk))
  const [totalValueLocked, totalValueLockedError] = useObservable(totalValueLocked$(ilk))

  const { t } = useTranslation()

  return (
    <WithErrorHandler error={[changesError, totalValueLockedError]}>
      <WithLoadingIndicator value={[yieldChanges, totalValueLocked]} customLoader={<div />}>
        {([_yieldsChanges, _totalValueLocked]) => {
          const details: HeadlineDetailsProp[] = [
            ...Object.values(_yieldsChanges.changes)
              .filter(({ days }) => [7, 90].includes(days))
              .map((yieldChange) => getHeadlineDetail(yieldChange)),
            {
              label: t('earn-vault.headlines.total-value-locked'),
              value: `$${formatFiatBalance(_totalValueLocked.value || zero)}`,
            },
          ]
          return (
            <EarnVaultHeadline
              header={ilk}
              tokens={[token]}
              details={details}
              followButton={followButton}
              shareButton={shareButton}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

function getHeadlineDetail(yieldChange?: YieldChange): HeadlineDetailsProp {
  const { t } = useTranslation()

  if (!yieldChange || yieldChange.days === 0) {
    return {
      label: '',
      value: '',
      sub: '',
      subColor: '',
    }
  }

  const { days, change, yieldValue } = yieldChange

  return {
    label: t(`earn-vault.headlines.yield-${days}`),
    value: getPercent(yieldValue),
    sub: getPercent(change),
    subColor: getSubColor(change),
  }
}

function getPercent(value?: BigNumber) {
  return formatPercent((value || zero).times(100), { precision: 2 })
}

function getSubColor(number: BigNumber) {
  if (number.lt(zero)) {
    return 'critical100'
  }
  return 'success100'
}
