import { getDummyUpdateInputFromIgInput, type FromClientUpdatePacket } from 'cc-multibakery/src/api'

export class UpdatePacketGather {
    private state!: FromClientUpdatePacket

    constructor() {
        /* in prestart */
        this.reset()

        const self = this
        sc.PlayerModel.inject({
            setElementMode(element, force, skipEffect) {
                if (!ig.client.isConnected()) return this.parent(element, force, skipEffect)

                if (ig.client.isExecutingUpdatePacketNow || this !== sc.model.player) {
                    return this.parent(element, force, skipEffect)
                } else if (this === sc.model.player) {
                    self.state.element = element
                }
                return false
            },
        })
    }

    private input() {
        if (!ig?.input) return
        if (this.state.paused) throw new Error()

        this.state.input = getDummyUpdateInputFromIgInput(ig.input)
    }
    private gatherInput() {
        if (this.state.paused) throw new Error()
        if (!ig.game?.playerEntity) return

        this.state.gatherInput = ig.ENTITY.Player.prototype.gatherInput.bind(ig.game.playerEntity)()
    }
    private relativeCursorPos() {
        if (this.state.paused) throw new Error()
        this.state.relativeCursorPos = { x: 0, y: 0 }
        this.state.gatherInput = ig.game?.playerEntity?.gatherInput()
        ig.system?.getMapFromScreenPos(this.state.relativeCursorPos, sc.control.getMouseX(), sc.control.getMouseY())
    }

    private reset() {
        this.state = {
            type: 'ig.dummy.DummyPlayer',
        }
    }

    pop(): FromClientUpdatePacket {
        if (!ig.game?.pausedVirtual && !ig.loading && ig.ready && sc.model.isGame()) {
            this.relativeCursorPos()
            this.gatherInput()
            this.input()
        } else {
            this.state.paused = true
        }
        const state = this.state
        this.reset()
        return state
    }
}
