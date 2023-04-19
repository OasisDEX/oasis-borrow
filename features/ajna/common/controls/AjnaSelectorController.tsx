import { getNetworkContracts } from 'blockchain/contracts'
import { getToken } from 'blockchain/tokensMetadata'
import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet'
import { HeaderSelector, HeaderSelectorOption } from 'components/HeaderSelector'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { AjnaPoolsTable } from 'features/ajna/common/components/AjnaPoolsTable'
import { ajnaComingSoonPools, DEFAULT_SELECTED_TOKEN } from 'features/ajna/common/consts'
import { AjnaWrapper } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { PositionTableLoadingState } from 'features/vaultsOverview/components/PositionTableLoadingState'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useHash } from 'helpers/useHash'
import { uniq } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { useMemo, useRef, useState } from 'react'
import { Box } from 'theme-ui'

interface AjnaSelectorControllerProps {
  product: AjnaProduct
}

export function AjnaSelectorController({ product }: AjnaSelectorControllerProps) {
  const { t } = useTranslation()
  const { context$, ajnaPoolsTableData$ } = useAppContext()
  const [contextData, contextError] = useObservable(context$)
  const [ajnaPoolsTableData, ajnaPoolsTableError] = useObservable(ajnaPoolsTableData$)
  const [hash] = useHash()
  const ref = useRef<HTMLDivElement>(null)
  const isEarnProduct = product === 'earn'

  const options = useMemo(
    () =>
      uniq(
        [
          ...(contextData
            ? Object.keys(getNetworkContracts(contextData.chainId).ajnaPoolPairs)
            : []),
          ...ajnaComingSoonPools,
        ].map((pool) => pool.split('-')[isEarnProduct ? 1 : 0]),
      )
        .sort()
        .map((token) => ({
          label: token,
          value: token,
          icon: getToken(token).iconCircle,
        })),
    [contextData, isEarnProduct],
  )
  const defaultOptionValue = hash.length ? hash.replace('#', '') : DEFAULT_SELECTED_TOKEN
  const defaultOption = options.filter((option) => option.value === defaultOptionValue)[0]
  const [selected, setSelected] = useState<HeaderSelectorOption>(defaultOption)

  return (
    <WithConnection>
      <WithTermsOfService>
        <AjnaWrapper>
          <AnimatedWrapper>
            <AjnaHeader
              title={
                <Box ref={ref} sx={{ position: 'relative', mb: 3, zIndex: 2 }}>
                  {t(`ajna.product-page.${product}.heading.pre`)}
                  <HeaderSelector
                    defaultOption={defaultOption}
                    gradient={['#f154db', '#974eea']}
                    options={options}
                    parentRef={ref}
                    onChange={setSelected}
                  />
                  {t(`ajna.product-page.${product}.heading.post`)}
                </Box>
              }
              intro={t(`ajna.product-page.${product}.intro`, { token: selected.value })}
            />
            <WithErrorHandler error={[contextError, ajnaPoolsTableError]}>
              <WithLoadingIndicator
                value={[contextData, ajnaPoolsTableData]}
                customLoader={<PositionTableLoadingState />}
              >
                {([context, ajnaPoolsTable]) => (
                  <AjnaPoolsTable
                    context={context}
                    ajnaPoolsTableData={ajnaPoolsTable}
                    selectedValue={selected.value}
                    isEarnProduct={isEarnProduct}
                    product={product}
                  />
                )}
              </WithLoadingIndicator>
            </WithErrorHandler>
          </AnimatedWrapper>
        </AjnaWrapper>
      </WithTermsOfService>
    </WithConnection>
  )
}
