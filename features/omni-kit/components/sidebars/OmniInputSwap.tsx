import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getToken } from 'blockchain/tokensMetadata'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { TokensGroup } from 'components/TokensGroup'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useAccount } from 'helpers/useAccount'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import type { FC, ReactElement, ReactNode } from 'react'
import React, { useMemo, useRef, useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'

interface OmniInputSwapProps {
  children: (params: { swapController?: ReactNode }) => ReactElement
  defaultToken: string
  defaultTokenAddress: string
  defaultTokenBalance: BigNumber
  defaultTokenPrecision: number
  defaultTokenPrice: BigNumber
  type: 'pull' | 'return'
}

export const OmniInputSwap: FC<OmniInputSwapProps> = ({
  children,
  defaultToken,
  defaultTokenAddress,
  defaultTokenBalance,
  defaultTokenPrecision,
  defaultTokenPrice,
  type,
}) => {
  const {
    environment: { extraTokensData, networkId, productType, settings, shouldSwitchNetwork },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { pullToken },
    },
  } = useOmniProductContext(productType)

  const { walletAddress } = useAccount()

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<string>(pullToken?.token ?? defaultToken)

  const outsideRef = useOutsideElementClickHandler(() => setIsOpen(false))
  const scrollRef = useRef<HTMLDivElement>(null)

  const tokensList = useMemo(
    () => [
      {
        address: defaultTokenAddress,
        balance: defaultTokenBalance,
        precision: defaultTokenPrecision,
        price: defaultTokenPrice,
        token: defaultToken,
      },
      ...(settings[`${type}Tokens`]?.[networkId] ?? [])
        .filter((token) => token !== defaultToken)
        .map((token) => ({
          address: getNetworkContracts(networkId).tokens[token].address,
          balance: extraTokensData[token].balance,
          digits: getToken(token).digits,
          precision: getToken(token).precision,
          price: extraTokensData[token].price,
          token,
        }))
        .filter(({ balance }) => !balance.isZero())
        .sort((a, b) => b.balance.times(b.price).minus(a.balance.times(a.price)).toNumber()),
    ],
    [
      defaultToken,
      defaultTokenAddress,
      defaultTokenBalance,
      defaultTokenPrecision,
      defaultTokenPrice,
      extraTokensData,
      networkId,
      settings,
      type,
    ],
  )
  const showScroll =
    scrollRef.current && scrollRef.current.scrollHeight > scrollRef.current.offsetHeight

  const swapController = (
    <Box sx={{ position: 'absolute', left: 0, bottom: '22px' }} ref={outsideRef}>
      <Flex
        sx={{ alignItems: 'center', columnGap: 1, ml: '14px', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
        data-testid='deposit-token-selector'
      >
        <TokensGroup tokens={[selectedToken]} forceSize={32} />
        <ExpandableArrow direction={isOpen ? 'up' : 'down'} size={14} />
      </Flex>
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          minWidth: '100%',
          mt: '12px',
          ml: '2px',
          p: 2,
          borderRadius: 'medium',
          backgroundColor: 'neutral10',
          boxShadow: 'buttonMenu',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          zIndex: 1,
          transition: 'opacity 200ms, transform 200ms',
        }}
      >
        <Flex
          as="li"
          sx={{ justifyContent: 'space-between', mr: showScroll ? '14px' : 0, px: 2, pt: 2, pb: 1 }}
        >
          <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
            Token
          </Text>
          <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
            Balance
          </Text>
        </Flex>
        <Flex
          ref={scrollRef}
          as="ul"
          sx={{
            flexDirection: 'column',
            rowGap: 1,
            width: '268px',
            maxHeight: '312px',
            pl: 0,
            pr: showScroll ? 2 : 0,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
              borderRadius: 'large',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'secondary100',
              borderRadius: 'large',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: showScroll ? 'secondary60' : 'transparent',
              borderRadius: 'large',
            },
          }}
          data-testid='deposit-token-list'
        >
          {tokensList?.map(({ balance, token, ...rest }) => (
            <Flex
              as="li"
              key={token}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                columnGap: 2,
                p: 2,
                borderRadius: 'medium',
                cursor: 'pointer',
                transition: 'background-color 200ms',
                bg: selectedToken === token ? 'neutral30' : 'neutral10',
                '&:hover': {
                  bg: 'neutral30',
                },
              }}
              onClick={() => {
                setSelectedToken(token)
                setIsOpen(false)
                dispatch({ type: 'reset' })
                if (token === defaultToken) dispatch({ type: 'update-swap-token' })
                else
                  dispatch({
                    type: 'update-swap-token',
                    [`${type}Token`]: { balance, token, ...rest },
                  })
              }}
            >
              <Flex sx={{ alignItems: 'center', columnGap: 2 }}>
                <TokensGroup tokens={[token]} forceSize={32} />
                <Text variant="boldParagraph3">{token}</Text>
              </Flex>
              <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
                {formatCryptoBalance(balance)}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>
    </Box>
  )

  return children({
    ...(walletAddress && !shouldSwitchNetwork && tokensList.length > 1 && { swapController }),
  })
}
