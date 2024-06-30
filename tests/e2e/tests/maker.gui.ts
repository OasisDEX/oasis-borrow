// tests/example.spec.ts
import { test } from '@guardianui/test'

test.describe('Maker', () => {
  test.beforeEach(async ({ page, gui }) => {
    // Initialize a fork of Ethereum mainnet (chain ID 1)
    await gui.initializeChain(1)

    await page.goto('/')

    // Set ETH balance
    await gui.setEthBalance('100000000000000000000000')

    // OHM: 0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5
    // DAI: 0x6b175474e89094c44da98b954eedeac495271d0f
    // USDC: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
    const contractToken = '0x6b175474e89094c44da98b954eedeac495271d0f'
    // Set OHM/DAI/USDC balance
    await gui.setAllowance(
      contractToken,
      '0xb63cac384247597756545b500253ff8e607a8020',
      '1000000000000000000000000',
    )

    // Set staking contract's approval to spend OHM/DAI/USDC
    await gui.setBalance(contractToken, '1000000000000000000000000')

    // Connect wallet
    await page.getByRole('button', { name: 'Connect Wallet' }).click()
    await page.getByRole('button', { name: 'Metamask' }).click()
    // Terms of Service popup is displayed
    await page.getByRole('button', { name: 'Sign message' }).click()
    await page.getByText('I have read and accept the Terms of Service.').click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  //   test.afterEach(async ({ page, gui }) => {
  //     // Do something after each test
  //   })

  // Returning error with Maker at the moment
  test.skip('Should create a Maker position', async ({ page }) => {
    await page.getByRole('button', { name: 'Earn' }).nth(0).click()

    // await page.locator('input[placeholder="0 ETH"]').type('100')
    // await page.getByRole('button', { name: 'Create Smart DeFi account' }).click()
    // // A new 'Create Smart DeFi account' button is displayed
    // await page.getByRole('button', { name: 'Create Smart DeFi account' }).click()

    await page.pause()
  })
})
