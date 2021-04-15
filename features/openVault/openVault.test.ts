/* eslint-disable func-style */

// describe('openVault', () => {
//   beforeEach(() => {})

//   describe('parseVaultIdFromReceiptLogs', () => {
//     it('should return vaultId', () => {
//       const vaultId = parseVaultIdFromReceiptLogs(newCDPTxReceipt)
//       expect(vaultId!.toString()).to.equal('3281')
//     })
//     it('should return undefined if NewCdp log is not found', () => {
//       const vaultId = parseVaultIdFromReceiptLogs({ logs: [] })
//       expect(vaultId).to.equal(undefined)
//     })
//   })

//   describe('createOpenVault$', () => {
//     type FixtureProps = Partial<OpenVaultState> & {
//       title?: string
//       context?: ContextConnected
//       proxyAddress?: string
//       proxyAddress$?: Observable<string>
//       allowance?: BigNumber
//       ilks$?: Observable<string[]>
//       priceInfo?: Partial<PriceInfo>
//       balanceInfo?: Partial<BalanceInfo>
//       ilk?: string
//       txHelpers?: TxHelpers
//     }

//     function createTestFixture({
//       context,
//       proxyAddress,
//       proxyAddress$,
//       allowance = maxUint256,
//       ilks$,
//       priceInfo,
//       balanceInfo,
//       ilk = 'ETH-A',
//       txHelpers,
//       stage,
//       depositAmount,
//       ...otherState
//     }: FixtureProps = {}) {
//       const context$ = of(context || protoContextConnected)
//       const txHelpers$ = of(txHelpers || protoTxHelpers)
//       const allowance$ = _.constant(of(allowance || maxUint256))

//       const protoBalanceInfo: BalanceInfo = {
//         collateralBalance: zero,
//         ethBalance: zero,
//         daiBalance: zero,
//         ...balanceInfo,
//       }

//       const protoPriceInfo = {
//         ...(ilk === 'ETH-A'
//           ? protoETHPriceInfo
//           : ilk === 'WBTC-A'
//           ? protoWBTCPriceInfo
//           : protoUSDCPriceInfo),
//         ...(priceInfo || {}),
//       }

//       const protoIlkData =
//         ilk === 'ETH-A'
//           ? protoETHAIlkData
//           : ilk === 'WBTC-A'
//           ? protoWBTCAIlkData
//           : protoUSDCAIlkData

//       const balanceInfo$ = () => of(protoBalanceInfo)
//       const priceInfo$ = () => of(protoPriceInfo)
//       const ilkData$ = () => of(protoIlkData)

//       const ilkToToken$ = of((ilk: string) => ilk.split('-')[0])
//       const openVault$ = createOpenVault$(
//         context$,
//         txHelpers$,
//         _.constant(proxyAddress$ || of(proxyAddress)),
//         allowance$,
//         priceInfo$,
//         balanceInfo$,
//         ilks$ || of(['ETH-A', 'WBTC-A', 'USDC-A']),
//         ilkData$,
//         ilkToToken$,
//         ilk,
//       )

//       const newState: Partial<OpenVaultState> = {
//         ...otherState,
//         ...(stage && { stage }),
//         ...(depositAmount && {
//           depositAmount,
//           depositAmountUSD: depositAmount.times(protoPriceInfo.currentCollateralPrice),
//         }),
//       }

//       openVault$.pipe(first()).subscribe(
//         ({ injectStateOverride }: any) => {
//           if (injectStateOverride) {
//             injectStateOverride(newState || {})
//           }
//         },
//         () => {},
//       )
//       return openVault$
//     }

//     function createMockTxState<T extends TxMeta>(
//       meta: T,
//       status: TxStatus = TxStatus.Success,
//       receipt: unknown = {},
//     ): Observable<TxState<T>> {
//       if (status === TxStatus.Success) {
//         const txState = {
//           account: '0x',
//           txNo: 0,
//           networkId: '1',
//           meta,
//           start: new Date(),
//           lastChange: new Date(),
//           dismissed: false,
//           status,
//           txHash: '0xhash',
//           blockNumber: 0,
//           receipt,
//           confirmations: 15,
//           safeConfirmations: 15,
//         }
//         return of(txState)
//       } else if (status === TxStatus.Failure) {
//         const txState = {
//           account: '0x',
//           txNo: 0,
//           networkId: '1',
//           meta,
//           start: new Date(),
//           lastChange: new Date(),
//           dismissed: false,
//           status,
//           txHash: '0xhash',
//           blockNumber: 0,
//           receipt,
//         }
//         return of(txState)
//       } else {
//         throw new Error('Not implemented yet')
//       }
//     }

//     it('Should start in an editing stage', () => {
//       const state = getStateUnpacker(createTestFixture())
//       const s = state()
//       expect(s.stage).to.be.equal('editing')
//     })

//     it('should throw error if ilk is not valid', () => {
//       const state = getStateUnpacker(createTestFixture({ ilk: 'ETH-Z' }))
//       expect(state).to.throw()
//     })

//     it('should wait for ilks to fetch before propagating', () => {
//       const ilks$ = new Subject<string[]>()
//       const state = getStateUnpacker(createTestFixture({ ilks$ }))
//       expect(state()).to.be.undefined
//       ilks$.next(['ETH-A'])
//       expect(state().stage).to.be.deep.equal('editing')
//     })

//     it('editing.updateDeposit()', () => {
//       const depositAmount = new BigNumber(5)
//       const state = getStateUnpacker(createTestFixture())
//       state().updateDeposit!(depositAmount)
//       expect(state().depositAmount!.toString()).to.be.equal(depositAmount.toString())
//       expect(state().stage).to.be.equal('editing')
//     })

//     it('editing.updateDepositUSD()', () => {
//       const depositAmount = new BigNumber(5)
//       const depositAmountUSD = protoETHPriceInfo.currentCollateralPrice.times(depositAmount)
//       const state = getStateUnpacker(createTestFixture())
//       state().updateDepositUSD!(depositAmountUSD)
//       expect(state().depositAmount!.toString()).to.be.equal(depositAmount.toString())
//       expect(state().depositAmountUSD!.toString()).to.be.equal(depositAmountUSD.toString())
//     })

//     it('editing.updateGenerate()', () => {
//       const depositAmount = new BigNumber(5)
//       const generateAmount = new BigNumber(3000)
//       const state = getStateUnpacker(createTestFixture())
//       state().updateDeposit!(depositAmount)
//       state().updateGenerate!(generateAmount)
//       expect(state().generateAmount).to.be.undefined
//       state().toggleGenerateOption!()
//       state().updateGenerate!(generateAmount)
//       expect(state().generateAmount!.toString()).to.be.equal(generateAmount.toString())
//     })

//     it('editing.progress()', () => {
//       const state = getStateUnpacker(createTestFixture())
//       state().progress!()
//       expect(state().stage).to.be.equal('proxyWaitingForConfirmation')
//     })

//     it('creating proxy', () => {
//       const proxyAddress$ = new Subject<string>()
//       const proxyAddress = '0xProxyAddress'
//       const state = getStateUnpacker(
//         createTestFixture({
//           proxyAddress$,
//           txHelpers: {
//             ...protoTxHelpers,
//             sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
//               createMockTxState(meta),
//           },
//         }),
//       )
//       proxyAddress$.next()
//       state().progress!()
//       expect(state().stage).to.be.equal('proxyWaitingForConfirmation')
//       state().progress!()
//       proxyAddress$.next(proxyAddress)
//       expect(state().stage).to.be.equal('proxySuccess')
//       expect(state().proxyAddress).to.be.equal(proxyAddress)
//     })

//     it('creating proxy failure', () => {
//       const proxyAddress$ = new Subject<string>()
//       const proxyAddress = '0xProxyAddress'
//       const state = getStateUnpacker(
//         createTestFixture({
//           proxyAddress$,
//           txHelpers: {
//             ...protoTxHelpers,
//             sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) =>
//               createMockTxState(meta, TxStatus.Failure),
//           },
//         }),
//       )
//       proxyAddress$.next()
//       state().progress!()
//       state().progress!()
//       proxyAddress$.next(proxyAddress)
//       expect(state().stage).to.be.equal('proxyFailure')
//     })

//     it('setting allowance', () => {
//       const proxyAddress = '0xProxyAddress'
//       const state = getStateUnpacker(
//         createTestFixture({
//           ilk: 'WBTC-A',
//           proxyAddress,
//           allowance: new BigNumber(99),
//           depositAmount: new BigNumber(100),
//           balanceInfo: { collateralBalance: new BigNumber(100) },
//           txHelpers: {
//             ...protoTxHelpers,
//             sendWithGasEstimation: <B extends TxMeta>(_allowance: any, meta: B) =>
//               createMockTxState(meta),
//           },
//         }),
//       )
//       state().progress!()
//       expect(state().stage).to.be.equal('allowanceWaitingForConfirmation')
//       state().progress!()
//       expect(state().stage).to.be.equal('allowanceSuccess')
//     })

//     it('setting allowance failure', () => {
//       const proxyAddress = '0xProxyAddress'
//       const state = getStateUnpacker(
//         createTestFixture({
//           ilk: 'WBTC-A',
//           proxyAddress,
//           allowance: new BigNumber(99),
//           depositAmount: new BigNumber(100),
//           balanceInfo: { collateralBalance: new BigNumber(100) },
//           txHelpers: {
//             ...protoTxHelpers,
//             sendWithGasEstimation: <B extends TxMeta>(_allowance: any, meta: B) =>
//               createMockTxState(meta, TxStatus.Failure),
//           },
//         }),
//       )
//       state().progress!()
//       state().progress!()
//       expect(state().stage).to.be.equal('allowanceFailure')
//     })

//     it('editing.progress(proxyAddress, allowance)', () => {
//       const state = getStateUnpacker(createTestFixture({ proxyAddress: '0xProxyAddress' }))
//       state().progress!()
//       expect(state().stage).to.be.equal('openWaitingForConfirmation')
//     })

//     it('opening vault', () => {
//       const state = getStateUnpacker(
//         createTestFixture({
//           proxyAddress: '0xProxyAddress',
//           txHelpers: {
//             ...protoTxHelpers,
//             send: <B extends TxMeta>(_open: any, meta: B) =>
//               createMockTxState(meta, TxStatus.Success, newCDPTxReceipt),
//           },
//         }),
//       )
//       state().progress!()
//       expect(state().stage).to.be.equal('openWaitingForConfirmation')
//       state().progress!()
//       expect(state().stage).to.be.equal('openSuccess')
//       expect(state().id!.toString()).to.be.equal('3281')
//     })

//     it('opening vault failure', () => {
//       const state = getStateUnpacker(
//         createTestFixture({
//           proxyAddress: '0xProxyAddress',
//           txHelpers: {
//             ...protoTxHelpers,
//             send: <B extends TxMeta>(_open: any, meta: B) =>
//               createMockTxState(meta, TxStatus.Failure),
//           },
//         }),
//       )
//       state().progress!()
//       state().progress!()
//       expect(state().stage).to.be.equal('openFailure')
//     })
//   })

//   describe('openVault stage categories', () => {
//     it('should identify editing stage correctly', () => {
//       const { isEditingStage } = categoriseOpenVaultStage('editing')
//       expect(isEditingStage).to.be.true
//     })

//     it('should identify proxy stages correctly', () => {
//       expect(categoriseOpenVaultStage('proxyWaitingForConfirmation').isProxyStage).to.be.true
//       expect(categoriseOpenVaultStage('proxyWaitingForApproval').isProxyStage).to.be.true
//       expect(categoriseOpenVaultStage('proxyInProgress').isProxyStage).to.be.true
//       expect(categoriseOpenVaultStage('proxyFailure').isProxyStage).to.be.true
//       expect(categoriseOpenVaultStage('proxySuccess').isProxyStage).to.be.true
//     })

//     it('should identify allowance stages correctly', () => {
//       expect(categoriseOpenVaultStage('allowanceWaitingForConfirmation').isAllowanceStage).to.be
//         .true
//       expect(categoriseOpenVaultStage('allowanceWaitingForApproval').isAllowanceStage).to.be.true
//       expect(categoriseOpenVaultStage('allowanceInProgress').isAllowanceStage).to.be.true
//       expect(categoriseOpenVaultStage('allowanceFailure').isAllowanceStage).to.be.true
//       expect(categoriseOpenVaultStage('allowanceSuccess').isAllowanceStage).to.be.true
//     })

//     it('should identify open stages correctly', () => {
//       expect(categoriseOpenVaultStage('openWaitingForConfirmation').isOpenStage).to.be.true
//       expect(categoriseOpenVaultStage('openWaitingForApproval').isOpenStage).to.be.true
//       expect(categoriseOpenVaultStage('openInProgress').isOpenStage).to.be.true
//       expect(categoriseOpenVaultStage('openFailure').isOpenStage).to.be.true
//       expect(categoriseOpenVaultStage('openSuccess').isOpenStage).to.be.true
//     })
//   })
// })
