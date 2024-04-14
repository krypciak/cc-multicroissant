import type { ToClientUpdatePacket } from 'cc-multibakery/src/api'
import { EntityStateEntry } from 'cc-multibakery/src/state/states'

export function runUpdatePacket(packet: ToClientUpdatePacket) {
    ig.client.isExecutingUpdatePacketNow = true
    if (packet.vars) {
        for (const { path, value } of packet.vars) {
            ig.vars.set(path, value)
        }
    }

    if (packet.entityStates && ig.game?.maps?.length > 0 /* check if the game has loaded already */) {
        for (const uuid in packet.entityStates) {
            const state = packet.entityStates[uuid]

            if (state.type == 'ig.dummy.DummyPlayer') {
                setPlayerState(state, uuid)
            } else throw new Error(`Entity uuid: ${uuid} type: ${state.type} is not implemeneted`)
        }
    }
    if (packet.playersLeft) {
        console.log(packet.playersLeft)
        for (const uuid of packet.playersLeft) {
            const player = ig.game.entitiesByUUID[uuid]
            if (!player) throw new Error('tried to "leave" a non exisitng player')
            if (player.type !== 'ig.dummy.DummyPlayer') throw new Error('tried to "leave" a non player')
            player.kill()
            delete ig.game.entitiesByUUID[player.uuid]
        }
    }
    ig.client.isExecutingUpdatePacketNow = false
}
function setPlayerState(state: EntityStateEntry<'ig.dummy.DummyPlayer'>, uuid: string) {
    let dummy = ig.game.entitiesByUUID[uuid] as ig.dummy.DummyPlayer | undefined
    if (dummy?._killed) dummy = undefined

    if (state.username == ig.client.username && !dummy) {
        if (!(ig.game.playerEntity instanceof ig.dummy.DummyPlayer)) throw new Error('not possible')
        dummy = ig.game.playerEntity
        delete ig.game.entitiesByUUID[dummy.uuid]
        dummy.uuid = uuid
        ig.game.entitiesByUUID[uuid] = dummy
        if (ig.client.serverSettings!.godmode) ig.godmode(dummy.model)
    } else if (!dummy) {
        dummy = ig.game.spawnEntity(ig.dummy.DummyPlayer, 0, 0, 0, { username: state.username!, uuid })
        console.log('creating ', state.username, ig.loading, ig.ready)
        ig.game.entitiesByUUID[uuid] = dummy
        if (ig.client.serverSettings!.godmode) ig.godmode(dummy.model)
        dummy.showUsernameBox()
        console.log('created ')
    }

    dummy.setState(state)
}
