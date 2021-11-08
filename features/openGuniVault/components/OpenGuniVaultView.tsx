import { useAppContext } from 'components/AppContextProvider'
import { useObservableWithError } from 'helpers/observableHook'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { Box, Container, Grid, Text } from 'theme-ui'
import BigNumber from 'bignumber.js'
import moment from 'moment'
import { AllowanceOption } from 'features/allowance/allowance'
import { type } from 'os'

function PreviewObject({ object, indent = 0 }) {
  // TODO remove it
  return (
    <Box sx={{ ml: `${indent * 30}px` }}>
      {Object.entries(object).map(([key, value]) => {
        if (BigNumber.isBigNumber(value)) {
          return (
            <Box>
              {key}:{' '}
              <Box as={'span'} sx={{ fontWeight: 'bold' }}>
                {value.toString()}
              </Box>
            </Box>
          )
        }
        if (moment.isDate(value)) {
          if (Array.isArray(value)) {
            return (
              <Box>
                {key}:
                <Box as={'span'} sx={{ fontWeight: 'bold' }}>
                  {value.toString()}
                </Box>
              </Box>
            )
          }
        }
        if (Array.isArray(value)) {
          return (
            <Box>
              {key}:
              <Box as={'span'} sx={{ fontWeight: 'bold' }}>
                {JSON.stringify(value)}
              </Box>
            </Box>
          )
        }
        if (typeof value === 'object') {
          return (
            <Box>
              {key}: <PreviewObject object={value} indent={indent + 1} />
            </Box>
          )
        }
        if (typeof value === 'function') {
          return (
            <Box>
              {key}:
              <Box as={'span'} sx={{ fontWeight: 'bold' }}>
                Function
              </Box>
            </Box>
          )
        }

        if (typeof value === 'boolean') {
          return (
            <Box>
              {key}:
              <Box as={'span'} sx={{ fontWeight: 'bold' }}>
                {value.toString()}
              </Box>
            </Box>
          )
        }

        return (
          <Box>
            {key}:
            <Box as={'span'} sx={{ fontWeight: 'bold' }}>
              <>{value ? value : 'UNDEFINED OR NULL'}</>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

export function OpenGuniVaultView({ ilk }: { ilk: string }) {
  const { openGuniVault$, accountData$, context$ } = useAppContext()
  //   const multiplyVaultWithIlk$ = openGuniVault$(ilk)

  const openVaultWithError = useObservableWithError(openGuniVault$(ilk))

  // useEffect(() => {
  //   const subscription = createOpenMultiplyVaultAnalytics$(
  //     accountData$,
  //     multiplyVaultWithIlk$,
  //     context$,
  //     trackingEvents,
  //   ).subscribe()

  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [])

  return (
    <WithErrorHandler error={openVaultWithError.error}>
      <WithLoadingIndicator {...openVaultWithError} customLoader={<VaultContainerSpinner />}>
        {(vault) => (
          <Container variant="vaultPageContainer">
            {console.log(vault)}
            <input
              type="number"
              value={vault.depositAmount?.toString()}
              onChange={(e) =>
                vault.updateDeposit && vault.updateDeposit(new BigNumber(e.target.value))
              }
            />
            <button onClick={vault.progress}>progress</button>
            <button onClick={vault.regress}>regress</button>

            <label>
              <input
                type="radio"
                name="allowance"
                value={AllowanceOption.DEPOSIT_AMOUNT}
                checked={vault.selectedAllowanceRadio === AllowanceOption.DEPOSIT_AMOUNT}
                onChange={(e) =>
                  vault.setAllowanceAmountToDepositAmount &&
                  vault.setAllowanceAmountToDepositAmount()
                }
              />
              deposit
            </label>
            <label>
              <input
                type="radio"
                name="allowance"
                value={AllowanceOption.UNLIMITED}
                checked={vault.selectedAllowanceRadio === AllowanceOption.UNLIMITED}
                onChange={(e) =>
                  vault.setAllowanceAmountUnlimited && vault.setAllowanceAmountUnlimited()
                }
              />
              unlimited
            </label>
            <label>
              <input
                type="radio"
                name="allowance"
                value={AllowanceOption.CUSTOM}
                checked={vault.selectedAllowanceRadio === AllowanceOption.CUSTOM}
                onChange={(e) => vault.setAllowanceAmountCustom && vault.setAllowanceAmountCustom()}
              />
              custom
              <input
                onChange={(e) => vault.updateAllowanceAmount!(new BigNumber(e.target.value))}
                type="number"
              ></input>
            </label>
            <PreviewObject object={vault} />
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
