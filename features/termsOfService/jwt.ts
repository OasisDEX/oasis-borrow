
import { getNetworkId } from '@oasisdex/web3-context'
import { decode } from 'jsonwebtoken'
import getConfig from 'next/config'
import { Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { fromPromise } from 'rxjs/internal-compatibility'
import { map } from 'rxjs/operators'
import Web3 from 'web3'
import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk';
import { recoverPersonalSignature } from 'eth-sig-util'

const basePath = getConfig()?.publicRuntimeConfig.basePath || ''

export type JWToken = string

export function jwtAuthGetToken(address: string): JWToken | undefined {
  const token = localStorage.getItem(`token-b/${address}`)
  if (token && token !== 'xxx') {
    const parsedToken = JSON.parse(atob(token.split('.')[1]))
    // remove old tokens
    if (!parsedToken.chainId) {
      localStorage.removeItem(`token-b/${address}`)
      return undefined
    }
  }
  return token === null ? undefined : token
}

export function jwtAuthSetupToken$(
  web3: Web3,
  account: string,
  isGnosisSafe: boolean,
): Observable<JWToken> {
  const token = jwtAuthGetToken(account)
  if (token === undefined) {
    return fromPromise(requestJWT(web3, account, isGnosisSafe))
  }
  return of(token)
}

async function requestJWT(web3: Web3, account: string, isGnosisSafe: boolean): Promise<string> {
  console.log({
    isGnosisSafe,
    web3,
    provider: web3.givenProvider,
    cProvider: web3.currentProvider
  })
  const web3Instance = web3
  const addressForSignature = account

  const challenge = await requestChallenge(account).toPromise()
  const chainId = getNetworkId()

  if (isGnosisSafe) {
    const sdk = new SafeAppsSDK();
    console.log(sdk)
    console.log('Signing challenge: ', challenge)
    const dataToSign = getDataToSignFromChallenge(challenge)
    const env = await sdk.safe.getEnvironmentInfo()
    const info = await sdk.safe.getInfo()
    const tx = await sdk.txs.signMessage(dataToSign)

    console.log({ env, info, tx })
    const { detailedExecutionInfo } = await sdk.txs.getBySafeTxHash(tx.safeTxHash)

    if (detailedExecutionInfo?.type === 'MULTISIG') {

      const confirmation = detailedExecutionInfo.confirmations[0]
      const signer = confirmation.signer.value
      console.log({ confirmation })
      try {

        const test = await web3.eth.personal.sign(dataToSign, addressForSignature, '')
        console.log(test)
      } catch (e) {
        console.log(e)
      }

      const isSigned = await sdk.safe.isMessageSigned(dataToSign, confirmation.signature)

      const response = recoverPersonalSignature({ data: dataToSign, sig: confirmation.signature! })

      console.log({ response, signer, confirmation, challenge, isSigned })
      const safeJwt = await requestSignin({ challenge, signature: confirmation.signature!, chainId }).toPromise()

      return safeJwt
    }
  } else {

    const signature = await signTypedPayload(challenge, web3Instance, addressForSignature)
    console.log({ signature });
    const jwt = await requestSignin({ challenge, signature, chainId }).toPromise()

    localStorage.setItem(`token-b/${account}`, jwt)

    return jwt
  }

  throw new Error('')
}

async function signTypedPayload(challenge: string, web3: Web3, account: string): Promise<string> {
  const data = getDataToSignFromChallenge(challenge)

  return web3.eth.personal.sign(data, account, '')
}

function requestChallenge(address: string): Observable<string> {
  return ajax({
    url: `/api/auth/challenge`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { address: address.toLowerCase() },
  }).pipe(map((resp) => resp.response.challenge))
}

function requestSignin({
  signature,
  challenge,
  chainId,
}: {
  signature: string
  challenge: string
  chainId: number
}): Observable<string> {
  return ajax({
    url: `${basePath}/api/auth/signin`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { signature, challenge, chainId },
  }).pipe(map((resp) => resp.response.jwt))
}

function getDataToSignFromChallenge(challenge: string): string {
  const decodedChallenge = decode(challenge) as any
  return `Sign to verify your wallet ${decodedChallenge.address} (${decodedChallenge.randomChallenge})`
}
