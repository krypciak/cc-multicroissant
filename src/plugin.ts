import { PluginClass } from 'ultimate-crosscode-typedefs/modloader/mod'
import { Mod1 } from './types'
import { Client } from './client'

import 'setimmediate'

export default class CCMultiplayerClient implements PluginClass {
    static dir: string
    static mod: Mod1

    constructor(mod: Mod1) {
        CCMultiplayerClient.dir = mod.baseDirectory
        CCMultiplayerClient.mod = mod
        CCMultiplayerClient.mod.isCCL3 = mod.findAllAssets ? true : false
        CCMultiplayerClient.mod.isCCModPacked = mod.baseDirectory.endsWith('.ccmod/')
    }

    async prestart() {
        await import('../node_modules/cc-multibakery/src/misc/modify-prototypes')
        await import('../node_modules/cc-multibakery/src/misc/entity-uuid')
        ig.client = new Client()
    }

    async poststart() {
        ig.client.connect()
    }
}
