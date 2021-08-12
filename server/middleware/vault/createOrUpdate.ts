import express from 'express'
import { VaultType } from 'server/database/node_modules/@prisma/client'
import { prisma } from 'server/prisma'
import * as z from 'zod'

import { getUserFromRequest } from '../signature-auth/getUserFromRequest'
import { selectVaultById } from './get'

const vaultSchema = z.object({
    id: z.number(),
    type: z.enum(['borrow', 'multiply']),
    proxyAddress: z.string()
})

export async function createOrUpdate(req:express.Request, res: express.Response) {
    const params = vaultSchema.parse(req.params)
    const user = getUserFromRequest(req)

    const vaultData = {
        vault_id: params.id,
        type: params.type as VaultType,
        proxy_address: params.proxyAddress,
        owner_address: user.address
    }

    // if (params.type !== 'borrow' || 'multiply' ) {
    //     res
    //     .status(403)
    //     .send('Incorrect type of vault')
    // }

    const vault = await selectVaultById({ vaultId: params.id })
    if (vault === null || vault.owner_address === user.address) {
        await prisma.vault.upsert({
            where: {
                vault_id: params.id,
            },
            update: vaultData,
            create: vaultData,
        })
        res.sendStatus(200)
    } else {
        res.sendStatus(401)
    }
   
}