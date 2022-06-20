import BigNumber from 'bignumber.js'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { VaultChangesInformationArrow } from 'components/vault/VaultChangesInformation'
import { AppSpinner } from 'helpers/AppSpinner'
import { useState } from 'react'
import React from 'react'
import { theme } from 'theme'
import { Box, Flex, Grid, IconButton, Text } from 'theme-ui'

export interface DropDownValue {
  label: string
  value: string
  secondaryValue?: string
}

export interface ItemProps {
  label: string
  value?: string | BigNumber
  secondaryValue?: string
  dropdownValues?: DropDownValue[]
  isLoading?: boolean
}

// TODO: Add tooltip and loading state
// Note: Use this to phase out the VaultInformationContainer & VaultInformation components
export function Item({ label, dropdownValues, value, secondaryValue, isLoading }: ItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <Box
      as="li"
      sx={{
        fontSize: 1,
        fontWeight: 'semiBold',
      }}
    >
      <Flex>
        <Text
          sx={{
            mr: 'auto',
            color: theme.colors.text.subtitle,
          }}
          as="p"
        >
          {label}
        </Text>
        <Box>
          <Text
            sx={{
              color: 'primary',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isLoading ? (
              <AppSpinner />
            ) : (
              <>
                {`${value}`}
                {secondaryValue && (
                  <>
                    <VaultChangesInformationArrow />
                    {`${secondaryValue}`}
                  </>
                )}
                {dropdownValues?.length && (
                  <IconButton
                    onClick={() => setOpen(!open)}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      width: 'fit-content',
                      display: 'flex',
                      justifyContent: 'right',
                      ml: 1,
                    }}
                  >
                    <ExpandableArrow
                      direction={open ? 'up' : 'down'}
                      sx={{
                        pr: 0,
                      }}
                    />
                  </IconButton>
                )}
              </>
            )}
          </Text>
        </Box>
      </Flex>
      {open && (
        <Grid as="ul" gap={2} sx={{ p: 0, m: 0, pl: 3, mt: 2, listStyle: 'none' }}>
          {dropdownValues && dropdownValues.map((item) => <Item {...item} />)}
        </Grid>
      )}
    </Box>
  )
}
