import type { FromClientUpdatePacket } from 'cc-multibakery/src/api'

export class UpdatePacketGather {
    private state: FromClientUpdatePacket = {}

    constructor() {
        /* in prestart */
        this.pop()

        const self = this
        sc.PlayerModel.inject({
            setElementMode(element, force, skipEffect) {
                const ret = this.parent(element, force, skipEffect)
                if (ig.client.isConnected() && this === sc.model.player) {
                    self.state.element = element
                }
                return ret
            },
        })
    }

    private input() {
        if (!ig?.input) return
        if (this.state.paused) throw new Error()

        this.state.input = {
            isUsingMouse: ig.input.isUsingMouse,
            isUsingKeyboard: ig.input.isUsingKeyboard,
            isUsingAccelerometer: ig.input.isUsingAccelerometer,
            ignoreKeyboard: ig.input.ignoreKeyboard,
            mouseGuiActive: ig.input.mouseGuiActive,
            mouse: ig.input.mouse,
            accel: ig.input.accel,
            presses: ig.input.presses,
            keyups: ig.input.keyups,
            locks: ig.input.locks,
            delayedKeyup: ig.input.delayedKeyup,
            currentDevice: ig.input.currentDevice,
            actions: ig.input.actions,
        }
    }
    private gatherInput() {
        if (this.state.paused) throw new Error()
        this.state.gatherInput = ig.game?.playerEntity?.gatherInput()
    }
    private relativeCursorPos() {
        if (this.state.paused) throw new Error()
        this.state.relativeCursorPos = { x: 0, y: 0 }
        this.state.gatherInput = ig.game?.playerEntity?.gatherInput()
        ig.system?.getMapFromScreenPos(this.state.relativeCursorPos, sc.control.getMouseX(), sc.control.getMouseY())
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
        this.state = {}
        return state
    }
}
