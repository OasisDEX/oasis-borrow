import { Web3Provider } from '@ethersproject/providers'
import { getNetworkId } from '@oasisdex/web3-context'
import { useWeb3React } from '@web3-react/core'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Flex, Grid, Heading, Image, Text } from 'theme-ui'

import { ModalProps } from '../helpers/modalHook'
import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { Modal, ModalCloseIcon } from './Modal'

export type SwitchNetworkModalType = 'injected' | 'appNetwork' | 'userNetwork'

const mainnetId = 1

export function SwitchNetworkModal({ close, type }: ModalProps<{ type: SwitchNetworkModalType }>) {
  const { t } = useTranslation()
  const w = window as any
  const ethereum = w.ethereum
  const { push } = useRouter()
  const account = useWeb3React<Web3Provider>()
  const [userNetworkId, setUserNetworkId] = useState<number | undefined>(undefined)

  const appNetworkId = getNetworkId()

  useEffect(() => {
    const handleChainChange = (chainId: string) => {
      setUserNetworkId(parseInt(chainId, 16))
    }

    if (ethereum) {
      ethereum.on('chainChanged', handleChainChange)
    }

    return () => {
      ethereum.removeListener('chainChanged', handleChainChange)
    }
  }, [ethereum?.provider])

  useEffect(() => {
    const handleChainChange = (update: { chainId?: string }) => {
      if (update.chainId) {
        setUserNetworkId(parseInt(update.chainId, 16))
      }
    }

    if (account.connector) {
      account.connector?.on('Web3ReactUpdate', handleChainChange)
    }

    return () => {
      account.connector?.removeListener('Web3ReactUpdate', handleChainChange)
    }
  }, [account.connector])

  useEffect(() => {
    if (appNetworkId === userNetworkId) {
      close()
    }
  }, [userNetworkId])

  useEffect(() => {
    return () => {
      close()
    }
  }, [])

  async function handleSwitch() {
    if (ethereum) {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + appNetworkId.toString(16) }],
      })
    }
  }

  async function handleAppNetworkSwitch() {
    close()
    await push('/connect')
  }

  return (
    <Modal close={close} sx={{ maxWidth: '445px', margin: '0 auto' }}>
      <ModalCloseIcon {...{ close }} />
      <Grid p={4}>
        <Flex sx={{ alignItems: 'center', flexDirection: 'column' }}>
          <Image src={staticFilesRuntimeUrl('/static/img/switch_wallet.svg')} my="50px" />
          <Heading as="h2" sx={{ textAlign: 'center', mb: 2, fontSize: 5 }}>
            {(type === 'injected' || type === 'userNetwork') && t('wallet-wrong-network')}
            {type === 'appNetwork' && t('app-wrong-network')}
          </Heading>
          <Text variant="paragraph3" sx={{ color: 'neutral80', textAlign: 'center', mb: '24px' }}>
            {type === 'injected' && t('wallet-wrong-network-desc')}
            {type === 'appNetwork' && t('app-wrong-network-desc')}
            {type === 'userNetwork' && t('user-wrong-network-desc')}
          </Text>
          {ethereum?.isMetaMask && type === 'injected' && (
            <Button variant="primary" sx={{ fontSize: 3, width: '100%' }} onClick={handleSwitch}>
              {t('switch-network')}
            </Button>
          )}
          {appNetworkId !== mainnetId && type !== 'injected' && (
            <Button
              variant="primary"
              sx={{ fontSize: 3, width: '100%' }}
              onClick={handleAppNetworkSwitch}
            >
              {t('switch-to-mainnet')}
            </Button>
          )}
        </Flex>
      </Grid>
    </Modal>
  )
}
