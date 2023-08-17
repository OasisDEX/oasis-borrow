import { Icon } from '@makerdao/dai-ui-icons'
import { NetworkNames } from 'blockchain/networks'
import { AjnaFlow, AjnaProduct } from 'features/ajna/common/types'
import { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex } from 'theme-ui'

interface AjnaBorrowHeadlinePropsParams {
  collateralToken?: string
  flow: AjnaFlow
  id?: string
  product?: AjnaProduct
  quoteToken?: string
  collateralTokenSource?: string
  quoteTokenSource?: string
}

export function getAjnaHeadlineProps({
  collateralToken,
  flow,
  id,
  product,
  quoteToken,
  collateralTokenSource,
  quoteTokenSource,
}: AjnaBorrowHeadlinePropsParams) {
  const { t } = useTranslation()

  return {
    ...(collateralToken &&
      quoteToken && {
        header: (
          <>
            <Flex sx={{ alignItems: 'center' }}>
              {collateralToken}
              {collateralTokenSource === 'blockchain' && (
                <Icon
                  name="warning"
                  size="32px"
                  sx={{
                    verticalAlign: 'bottom',
                    color: 'red',
                  }}
                />
              )}
              /{quoteToken}
              {quoteTokenSource === 'blockchain' && (
                <Icon
                  name="warning"
                  size="32px"
                  sx={{
                    verticalAlign: 'bottom',
                    color: 'red',
                  }}
                />
              )}
            </Flex>
            {flow === 'open' && (
              <>
                {upperFirst(product)} {t('position')}
              </>
            )}
            {flow === 'manage' && <>#{id}</>}
          </>
        ),
        tokens: [collateralToken, quoteToken],
        protocol: {
          network: NetworkNames.ethereumMainnet,
          protocol: LendingProtocol.Ajna,
        },
      }),
  }
}
