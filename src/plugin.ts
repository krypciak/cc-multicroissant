import { PluginClass } from 'ultimate-crosscode-typedefs/modloader/mod'
import { Mod1 } from './types'
import { Client } from './client'

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
        ig.client = new Client()
    }

    async poststart() {
        ig.client.connect()
    }
}
