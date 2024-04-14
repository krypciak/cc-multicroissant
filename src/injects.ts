import { emptyGatherInput } from 'cc-multibakery/src/api'

sc.CrossCode.inject({
    createPlayer() {
        if (!ig.client.isConnected()) return this.parent()
        const dummy = this.spawnEntity(ig.dummy.DummyPlayer, 0, 0, 0, { username: ig.client.username, ignoreInputForcer: false })
        this.playerEntity = dummy
        sc.model.player = dummy.model
    },
})
ig.Game.inject({
    setPaused(paused) {
        const orig = this.paused
        this.parent(paused)
        if (!ig.client.isConnected()) return
        if (orig != paused && paused) ig.soundManager.popPaused()
        this.paused = false
        this.pausedVirtual = paused
    },
})

ig.dummy.DummyPlayer.inject({
    gatherInput() {
        if (ig.client.isConnected() && this === ig.game.playerEntity && ig.game.pausedVirtual) return emptyGatherInput()
        return this.parent()
    },
})

ig.Vars.inject({
    set(...args) {
        if (!ig.client.isConnected() || ig.client.isExecutingUpdatePacketNow) {
            this.parent(...args)
        }
    },
})
