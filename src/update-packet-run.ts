import type { ToClientUpdatePacket } from 'cc-multibakery/src/api'

export function runUpdatePacket(packet: ToClientUpdatePacket) {
    if (packet.vars) {
        for (const { path, value } of packet.vars) {
            ig.vars.set(path, value)
        }
    }
    if (packet.pos && ig.game.playerEntity) {
        if (!Vec3.equal(ig.game.playerEntity.coll.pos, packet.pos)) {
            ig.game.playerEntity.setPos(packet.pos.x, packet.pos.y, packet.pos.z)
        }
    }
}
