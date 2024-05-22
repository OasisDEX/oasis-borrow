import BigNumber from 'bignumber.js'
import { Icon } from 'components/Icon'
import { StatefulTooltip } from 'components/Tooltip'
import { partialTakeProfitConstants } from 'features/omni-kit/automation/constants'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import type { TranslateStringType } from 'helpers/translateStringType'
import type { ChangeEvent, FC, ReactNode } from 'react'
import React, { useState } from 'react'
import { question_o } from 'theme/icons'
import { Box, Button, Flex, Text } from 'theme-ui'

export const getPriceIncreasedByPercentage = (price: BigNumber, percentage: number) => {
  return price.plus(price.times(percentage))
}

interface SidebarInputWithOffsetsProps {
  useNegativeOffset: boolean
  priceFormat: string
  positionPriceRatio: BigNumber
  inputMask: any
  inputValue: string | undefined
  updateInputValue: (e: ChangeEvent<HTMLInputElement>) => void
  updateOffset: (value: BigNumber | undefined) => void
  percentageOffset: BigNumber | undefined
  label: ReactNode
  tooltip?: ReactNode

  showToggle?: boolean
  toggleOnLabel?: TranslateStringType
  toggleOffLabel?: TranslateStringType
  toggleOffPlaceholder?: TranslateStringType
  onToggle?: (toggleStatus: boolean) => void
  defaultToggle?: boolean
}

export const SidebarInputWithOffsets: FC<SidebarInputWithOffsetsProps> = ({
  useNegativeOffset,
  priceFormat,
  positionPriceRatio,
  inputMask,
  inputValue,
  updateInputValue,
  updateOffset,
  percentageOffset,
  label,
  tooltip,

  showToggle,
  onToggle,
  toggleOnLabel,
  toggleOffLabel,
  toggleOffPlaceholder,
  defaultToggle = true,
}) => {
  const [isFocus, setStartingPriceInputFocus] = useState<boolean>(false)
  const [toggleStatus, setToggleStatus] = useState<boolean>(defaultToggle)

  const toggleResolved = typeof defaultToggle === 'boolean' ? defaultToggle : toggleStatus
  const value = inputValue && `${formatCryptoBalance(new BigNumber(inputValue))}`

  return (
    <>
      <Box
        sx={{
          padding: 3,
          borderWidth: '1px',
          borderStyle: 'solid',
          mt: 2,
          border: '1px solid',
          borderRadius: 'medium',
          transition: 'border-color 200ms',
          borderColor: isFocus ? 'neutral70' : 'neutral20',
        }}
      >
        <Text variant="boldParagraph3" color="neutral80">
          <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Flex>
              {label}
              {tooltip && (
                <StatefulTooltip
                  tooltip={<Text variant="paragraph4">{tooltip}</Text>}
                  containerSx={{ display: 'inline' }}
                  inline
                  tooltipSx={{ maxWidth: '350px', left: '25px' }}
                >
                  <Icon
                    color={'neutral80'}
                    icon={question_o}
                    size="auto"
                    width="14px"
                    height="14px"
                    sx={{ position: 'relative', top: '2px', ml: 1, transition: 'color 200ms' }}
                  />
                </StatefulTooltip>
              )}
            </Flex>
            {showToggle && (
              <Text
                variant="paragraph4"
                sx={{
                  fontWeight: 'semiBold',
                  textAlign: 'right',
                  color: 'neutral80',
                }}
              >
                {showToggle && (
                  <Text
                    as="span"
                    sx={{
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (onToggle) onToggle(!toggleResolved)
                      setToggleStatus(!toggleResolved)
                    }}
                  >
                    {toggleResolved ? toggleOnLabel : toggleOffLabel}
                  </Text>
                )}
              </Text>
            )}
          </Flex>
        </Text>
        <Box
          sx={{
            position: 'relative',
            variant: 'text.boldParagraph3',
            '::after': {
              position: 'absolute',
              right: '5px',
              top: '15px',
              content: `"${priceFormat}"`,
              pointerEvents: 'none',
              opacity: '0.6',
            },
          }}
        >
          <BigNumberInput
            type="text"
            mask={inputMask}
            onFocus={() => {
              setStartingPriceInputFocus(true)
            }}
            onBlur={() => {
              setStartingPriceInputFocus(false)
            }}
            value={value}
            placeholder={toggleResolved ? `0` : (toggleOffPlaceholder as string)}
            onChange={updateInputValue}
            sx={{
              fontSize: 5,
              border: 'none',
              pl: 0,
              transition: 'opacity 200ms',
            }}
          />
        </Box>
        <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
          Now: {formatCryptoBalance(positionPriceRatio)} {priceFormat}
        </Text>
      </Box>
      <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {(useNegativeOffset
          ? partialTakeProfitConstants.startingPercentageOptionsShort
          : partialTakeProfitConstants.startingPercentageOptionsLong
        ).map((percentage) => (
          <Button
            key={percentage.toString()}
            variant="bean"
            sx={{
              color: 'neutral80',
              transition: 'color 200ms, background-color 200ms',
              '&:hover': {
                backgroundColor: 'neutral80',
                color: 'secondary60',
              },
              ...(percentageOffset?.toNumber() === percentage
                ? {
                    backgroundColor: 'neutral80',
                    color: 'secondary60',
                  }
                : {}),
            }}
            disabled={percentageOffset?.toNumber() === percentage || !toggleResolved}
            onClick={() => {
              updateOffset(new BigNumber(percentage))
            }}
          >
            {percentage === 0
              ? 'current'
              : `${useNegativeOffset ? '' : '+'}${formatPercent(new BigNumber(percentage).times(100))}`}
          </Button>
        ))}
      </Flex>
    </>
  )
}
