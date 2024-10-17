import type { TxMeta, TxState } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getTokenGuarded } from 'blockchain/tokensMetadata'
import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { useMainContext } from 'components/context/MainContextProvider'
import { DetailsSection } from 'components/DetailsSection'
import { SidebarSectionStatus } from 'components/sidebar/SidebarSectionStatus'
import { getOmniTxStatuses, useOmniGeneralContext } from 'features/omni-kit/contexts'
import { getOmniSidebarTransactionStatus } from 'features/omni-kit/helpers'
import type { OmniTxData } from 'features/omni-kit/hooks'
import { submitGenericOmniTransaction } from 'features/omni-kit/observables'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { formatCryptoBalance, formatUsdValue } from 'helpers/formatters/format'
import { handleTransactionTxState } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useMemo, useState } from 'react'
import { Button, Flex, Text } from 'theme-ui'

interface OmniErc20ClaimsProps {
  token: string
  claimable: BigNumber
  tx: OmniTxData
  prices: {
    [key: string]: BigNumber
  }
}

export const OmniRewardsClaims: FC<OmniErc20ClaimsProps> = ({ token, claimable, tx, prices }) => {
  const { t } = useTranslation()

  const { connectedContext$ } = useMainContext()
  const [context] = useObservable(connectedContext$)
  const { connect, setChain } = useConnection()
  const { isConnected } = useAccount()
  const [txState, setTxState] = useState<TxState<TxMeta>>()

  const {
    environment: { dpmProxy, isOwner, shouldSwitchNetwork, network, networkId },
  } = useOmniGeneralContext()

  const { isTxError, isTxInProgress, isTxWaitingForApproval, isTxSuccess } = getOmniTxStatuses(
    txState?.status,
  )

  const signer = context?.transactionProvider
  const rows = useMemo(() => {
    return [
      {
        items: {
          token: (
            <AssetsTableDataCellAsset
              asset={token}
              icons={[token]}
              description={getTokenGuarded(token)?.name || 'Reward Token'}
            />
          ),
          claimableNow: (
            <>
              {formatCryptoBalance(claimable)} {token}
              {prices[token] && (
                <>
                  <br />
                  <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
                    {formatUsdValue(claimable.times(prices[token]))}
                  </Text>
                </>
              )}
            </>
          ),
        },
      },
    ]
  }, [claimable, token, prices])
  const txSidebarProgress = t('erc-4626.position-page.earn.transaction.progress')
  const txSidebarSuccess = t('erc-4626.position-page.earn.transaction.success')
  const txSidebarStatus = useMemo(() => {
    if (txState) {
      const networkContracts = getNetworkContracts(networkId)

      return getOmniSidebarTransactionStatus({
        etherscan: networkContracts.etherscan.url,
        etherscanName: networkContracts.etherscan.name,
        isTxInProgress: isTxInProgress,
        isTxSuccess: isTxSuccess,
        text: isTxSuccess ? txSidebarSuccess : txSidebarProgress,
        txDetails: {
          txCost: zero,
          ...handleTransactionTxState(txState),
        },
      })?.at(0)
    } else return undefined
  }, [isTxInProgress, isTxSuccess, networkId, txSidebarProgress, txSidebarSuccess, txState])

  const isClaimButtonDisabled =
    !isOwner || !tx || isTxInProgress || isTxWaitingForApproval || isTxSuccess
  const claimButtonLabel = !isConnected
    ? t('connect-wallet')
    : shouldSwitchNetwork
      ? t('switch-network')
      : isTxError
        ? t('retry')
        : t('claim')

  return (
    <DetailsSection
      content={<AssetsResponsiveTable paddless rows={rows} verticalAlign="top" />}
      title={t('vault-token-rewards.title')}
      accordion
      accordionOpenByDefault
      footer={
        <Flex sx={{ flexDirection: 'column', rowGap: 3 }}>
          <Flex sx={{ justifyContent: 'flex-end' }}>
            <Button
              sx={{ px: 4 }}
              variant="tertiary"
              disabled={isClaimButtonDisabled}
              onClick={() => {
                if (!isConnected) connect()
                else if (shouldSwitchNetwork) setChain(network.hexId)
                else if (signer && tx && dpmProxy) {
                  submitGenericOmniTransaction({
                    networkId: networkId,
                    proxyAddress: dpmProxy,
                    setTxState,
                    signer,
                    txData: tx,
                  })()
                }
              }}
            >
              {claimButtonLabel}
            </Button>
          </Flex>
          {txSidebarStatus && <SidebarSectionStatus {...txSidebarStatus} />}
        </Flex>
      }
    />
  )
}
