import BigNumber from 'bignumber.js'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { YieldChange } from 'helpers/earn/calculations'
import moment from 'moment'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useAppContext } from '../../../../components/AppContextProvider'
import { EarnVaultHeadline } from '../../../../components/vault/EarnVaultHeadline'
import { HeadlineDetailsProp } from '../../../../components/vault/VaultHeadline'
import { WithErrorHandler } from '../../../../helpers/errorHandlers/WithErrorHandler'
import { formatFiatBalance, formatPercent } from '../../../../helpers/formatters/format'
import { useObservable } from '../../../../helpers/observableHook'
import { zero } from '../../../../helpers/zero'

export interface EarnVaultHeaderProps {
  ilk: string
  token: string
}

const currentDate = moment().startOf('day')
const previousDate = currentDate.clone().subtract(1, 'day')

export function GuniVaultHeader({ ilk, token }: EarnVaultHeaderProps) {
  const { yieldsChange$, totalValueLocked$ } = useAppContext()
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
          return <EarnVaultHeadline header={ilk} token={token} details={details} />
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
