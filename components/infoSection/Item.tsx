import type BigNumber from 'bignumber.js'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { Icon } from 'components/Icon'
import { Skeleton } from 'components/Skeleton'
import { StatefulTooltip } from 'components/Tooltip'
import type { TranslateStringType } from 'helpers/translateStringType'
import type { ReactNode } from 'react'
import React, { useState } from 'react'
import { arrow_right_light, question_o } from 'theme/icons'
import { Box, Flex, Grid, Text, type ThemeUIStyleObject } from 'theme-ui'

export type SecondaryVariantType = 'positive' | 'negative' | 'neutral'

export interface DropDownValue {
  label?: TranslateStringType
  value: string | ReactNode
  change?: string | ReactNode
  secondary?: {
    value: string
    variant?: SecondaryVariantType
  }
}

export interface ItemProps {
  label?: TranslateStringType
  labelColorPrimary?: boolean
  subLabel?: TranslateStringType
  value?: string | BigNumber | ReactNode
  // Select element type if you wish to render custom components within a dropdown
  dropDownElementType?: 'element' | 'default'
  change?: string | ReactNode
  secondary?: {
    value: string
    variant?: SecondaryVariantType
  }
  dropdownValues?: DropDownValue[]
  dropdownGroups?: DropDownValue[][]
  isLoading?: boolean
  isHeading?: boolean
  tooltip?: string
  itemWrapperSx?: ThemeUIStyleObject
}

function getSecondaryColor(variant: SecondaryVariantType): string {
  switch (variant) {
    case 'negative':
      return 'critical100'
    case 'neutral':
      return 'neutral80'
    case 'positive':
      return 'success100'
  }
}

export function InfoSectionLoadingState() {
  return <Skeleton width="88px" height="12px" color="dark" />
}

interface ItemLabelProps {
  isHeading: boolean
  label: string
  labelColorPrimary?: boolean
}

function ItemLabel({ isHeading, label, labelColorPrimary }: ItemLabelProps) {
  return (
    <Text
      {...(!isHeading
        ? {
            as: 'p',
            sx: {
              flexShrink: 0,
              mr: 'auto',
              color: labelColorPrimary ? 'primary100' : 'neutral80',
            },
          }
        : {
            as: 'h4',
            variant: 'paragraph3',
            sx: {
              color: 'primary100',
              fontWeight: 'semiBold',
            },
          })}
    >
      {label}
    </Text>
  )
}

export function Item({
  label,
  subLabel,
  dropdownValues,
  dropdownGroups,
  value,
  change,
  secondary,
  isLoading,
  dropDownElementType,
  labelColorPrimary,
  tooltip,
  isHeading = false,
  itemWrapperSx,
}: ItemProps) {
  const [open, setOpen] = useState(false)

  const dropdownValuesExist = (dropdownValues?.length || 0) > 0 || (dropdownGroups?.length || 0) > 0

  return (
    <Box
      as="li"
      sx={{
        fontSize: 1,
        fontWeight: 'semiBold',
        listStyle: 'none',
        ...itemWrapperSx,
      }}
    >
      <Flex
        sx={{
          cursor: !isLoading && dropdownValuesExist ? 'pointer' : 'auto',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
        }}
        onClick={() => {
          !isLoading && dropdownValuesExist && setOpen(!open)
        }}
      >
        {label &&
          (tooltip ? (
            <StatefulTooltip
              tooltip={tooltip}
              containerSx={{ alignItems: 'center' }}
              tooltipSx={{ transform: 'translateY(-100%)', right: ['0px', 'auto'], top: '-5px' }}
            >
              <ItemLabel
                label={label}
                labelColorPrimary={labelColorPrimary}
                isHeading={isHeading}
              />
              {tooltip && <Icon icon={question_o} size="16px" sx={{ ml: 1 }} color="neutral80" />}
            </StatefulTooltip>
          ) : (
            <ItemLabel label={label} labelColorPrimary={labelColorPrimary} isHeading={isHeading} />
          ))}
        <Text
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-end',
            color: 'primary100',
          }}
          as="div"
        >
          {isLoading ? (
            <InfoSectionLoadingState />
          ) : (
            <>
              {value && <>{React.isValidElement(value) ? value : `${value}`}</>}
              {change && (
                <>
                  <Icon icon={arrow_right_light} size="auto" width={10} height={7} sx={{ mx: 2 }} />
                  {React.isValidElement(change) ? change : `${change}`}
                </>
              )}
              {secondary && (
                <Text
                  as="span"
                  sx={{ ml: 1, color: getSecondaryColor(secondary.variant || 'neutral') }}
                >
                  ({secondary.value})
                </Text>
              )}
              {dropdownValuesExist && (
                <ExpandableArrow
                  direction={open ? 'up' : 'down'}
                  sx={{
                    mt: !isHeading ? 0 : '2px',
                    ml: 2,
                  }}
                />
              )}
            </>
          )}
        </Text>
      </Flex>
      {!isLoading && open && (
        <>
          {subLabel && (
            <Text
              sx={{
                fontWeight: 400,
                color: 'neutral80',
                fontSize: 2,
                mt: 2,
              }}
            >
              {subLabel}
            </Text>
          )}
          {dropdownValues && (
            <Grid
              as="ul"
              gap={!isHeading ? 2 : 3}
              sx={{ p: 0, m: 0, pl: dropDownElementType ? 'unset' : 3, mt: 3, listStyle: 'none' }}
            >
              {dropdownValues.map((item, idx) => (
                <Item {...item} key={item.label || idx} />
              ))}
            </Grid>
          )}
          {dropdownGroups && (
            <Grid
              as="ul"
              gap={!isHeading ? 2 : 3}
              sx={{ p: 0, m: 0, pl: dropDownElementType ? 'unset' : 3, mt: 3, listStyle: 'none' }}
            >
              {dropdownGroups
                .map((items) => {
                  return [
                    <div key={items[0].label} style={{ borderTop: '1px dashed #EAEAEA' }}>
                      {/* separator */}
                    </div>,
                    items.map((item, idx) => <Item {...item} key={item.label || idx} />),
                  ]
                })
                .flat()
                .slice(1)}
            </Grid>
          )}
        </>
      )}
    </Box>
  )
}
