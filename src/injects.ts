import { emptyGatherInput } from 'cc-multibakery/src/api'

sc.CrossCode.inject({
    createPlayer() {
        if (!client.isConnected()) return this.parent()
        const dummy = this.spawnEntity(ig.dummy.DummyPlayer, 0, 0, 0, { username: client.username, ignoreInputForcer: false })
        this.playerEntity = dummy
        sc.model.player = dummy.model
    },
})
ig.Game.inject({
    setPaused(paused) {
        const orig = this.paused
        this.parent(paused)
        if (!client.isConnected()) return
        if (orig != paused && paused) ig.soundManager.popPaused()
        this.paused = false
        this.pausedVirtual = paused
    },
})

ig.dummy.DummyPlayer.inject({
    gatherInput() {
        if (client.isConnected() && this === ig.game.playerEntity && ig.game.pausedVirtual) return emptyGatherInput()
        return this.parent()
    },
})

ig.Vars.inject({
    set(...args) {
        if (!client.isConnected() || client.isExecutingUpdatePacketNow) {
            this.parent(...args)
        }
    },
})
