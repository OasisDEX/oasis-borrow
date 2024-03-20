import type BigNumber from 'bignumber.js'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { TokensGroup } from 'components/TokensGroup'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { getTokenBalances$ } from 'features/shared/balanceInfo'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import type { FC } from 'react'
import React, { useMemo, useRef, useState } from 'react'
import { EMPTY } from 'rxjs'
import { Box, Flex, Text } from 'theme-ui'

interface OmniInputSwapProps {
  defaultToken: string
  defaultTokenBalance: BigNumber
  tokens: string[]
}

export const OmniInputSwap: FC<OmniInputSwapProps> = ({
  defaultToken,
  defaultTokenBalance,
  tokens,
}) => {
  const { walletAddress } = useAccount()
  const {
    environment: { networkId },
  } = useOmniGeneralContext()

  const [tokensBalanceData] = useObservable(
    useMemo(
      () => (walletAddress ? getTokenBalances$(tokens, walletAddress, networkId) : EMPTY),
      [networkId, tokens, walletAddress],
    ),
  )

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<string>(defaultToken)

  const outsideRef = useOutsideElementClickHandler(() => setIsOpen(false))
  const positionRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const tokensList = useMemo(
    () =>
      tokensBalanceData
        ? [
            {
              token: defaultToken,
              balance: defaultTokenBalance,
            },
            ...tokens.map((token, i) => ({
              token,
              balance: tokensBalanceData[i],
            })),
          ]
            .filter(({ balance }) => !balance.isZero())
            .sort((a, b) => b.balance.minus(a.balance).toNumber())
        : undefined,
    [defaultToken, defaultTokenBalance, tokens, tokensBalanceData],
  )
  const showScroll =
    scrollRef.current && scrollRef.current.scrollHeight > scrollRef.current.offsetHeight

  return (
    <Box sx={{ position: 'absolute', left: 0, bottom: '22px' }} ref={outsideRef}>
      <Flex
        ref={positionRef}
        sx={{ alignItems: 'center', columnGap: 1, ml: '14px', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
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
        >
          {tokensList?.map(({ balance, token }) => (
            <Flex
              as="li"
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                columnGap: 2,
                p: 2,
                borderRadius: 'medium',
                cursor: 'pointer',
                transition: 'background-color 200ms',
                '&:hover': {
                  backgroundColor: 'neutral30',
                },
              }}
              onClick={() => {
                setSelectedToken(token)
                setIsOpen(false)
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
}
