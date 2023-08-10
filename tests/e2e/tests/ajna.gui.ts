import { test } from '@guardianui/test'

test.describe('Ajna', () => {
  test.beforeEach(async ({ page, gui }) => {
    // Initialize a fork of Ethereum mainnet (chain ID 1)
    await gui.initializeChain(1)

    await page.goto('/ajna')

    // Set ETH balance
    await gui.setEthBalance('100000000000000000000000')

    // Connect wallet
    await page.getByRole('button', { name: 'Connect Wallet' }).click()
    await page.getByRole('button', { name: 'Metamask' }).click()
  })

  // test.afterEach(async ({ page, gui }) => {
  //   // Do something after each test
  // })

  test('Should create an Ajna position', async ({ page, gui }) => {
    await page.getByRole('button', { name: 'Borrow' }).nth(0).click()

    //
    await page.pause()
    //

    // Terms of Service popup is displayed
    await page.getByRole('button', { name: 'Sign message' }).click()
    await page.getByText('I have read and accept the Terms of Service.').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'I understand' }).click()

    await page.locator('input[placeholder="0 ETH"]').type('100')
    //
    await page.pause()
    //
    await page.getByRole('button', { name: 'Create Smart DeFi account' }).click()

    // A new 'Create Smart DeFi account' button is displayed
    // Confirm action
    await gui.validateContractInteraction(
      'button:has-text("Create Smart DeFi account")',
      '0xf7b75183a2829843db06266c114297dfbfaee2b6',
      // '0xB63cac384247597756545b500253ff8E607a8020',
      // '0xca71c36d26f515ad0cce1d806b231cbc1185cdfc',
    )
    // await page.getByRole('button', { name: 'Create Smart DeFi account' }).click()

    await page.pause()
  })
})
