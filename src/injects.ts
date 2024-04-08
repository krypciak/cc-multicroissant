import { emptyGatherInput } from 'cc-multibakery/src/api'

export {}

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

ig.ENTITY.Player.inject({
    gatherInput() {
        if (!ig.client.isConnected() || !ig.game.pausedVirtual) return this.parent()
        return emptyGatherInput()
    },
})
