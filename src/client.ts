import { io, Socket as _Socket } from 'socket.io-client'
import type { ClientToServerEvents, PlayerJoinResponse, ServerSettingsBase, ServerToClientEvents, ToClientUpdatePacket } from 'cc-multibakery/src/api.d.ts'
import { runUpdatePacket } from './update-packet-run'
import { UpdatePacketGather } from './update-packet-gather'
import { injectEntityStateDefinitions } from 'cc-multibakery/src/state/states'

type Socket = _Socket<ServerToClientEvents, ClientToServerEvents>
const TIMEOUT = 5000

export class Client {
    serverSettings?: ServerSettingsBase
    updatePacketGather: UpdatePacketGather
    socket!: Socket

    host!: string
    port!: number
    username!: string

    isExecutingUpdatePacketNow: boolean = false

    constructor() {
        this.updatePacketGather = new UpdatePacketGather()
        this.init()
    }
    private async init() {
        await import('../node_modules/cc-multibakery/src/misc/godmode')
        await import('../node_modules/cc-multibakery/src/dummy-player')
        await import('./injects')
        injectEntityStateDefinitions()

        const self = this
        sc.GameModel.inject({
            enterTitle() {
                this.parent()
                if (self.isConnected()) self.leave()
            },
        })
    }

    isConnected(): boolean {
        return !!this.serverSettings
    }

    private leave() {
        this.serverSettings = undefined
        this.socket.close()
        sc.model.enterReset()
        sc.model.enterRunning()
        ig.game.reset()
        sc.model.enterTitle()
    }

    async connect(
        host: string = 'localhost',
        port: number = 33405,
        username: string = `client${new Array(3)
            .fill(0)
            .map(_ => (Math.random() * 10).floor())
            .join('')}`
    ) {
        if (this.isConnected()) this.leave()

        this.socket = io(`ws://${host}:${port}`)
        const usernames: string[] = await this.socket.timeout(TIMEOUT).emitWithAck('getPlayerUsernames')
        console.log('usernames:', usernames)

        const joinData: PlayerJoinResponse = await this.socket.timeout(TIMEOUT).emitWithAck('join', username)
        if (joinData.usernameTaken) throw new Error(`username: ${username} is taken`)
        this.serverSettings = joinData.serverSettings
        this.host = host
        this.port = port
        this.username = username

        window.addEventListener('beforeunload', () => {
            this.socket.close()
        })

        const saveData = new ig.SaveSlot(joinData.state.saveData)
        sc.model.enterGame()
        sc.model.enterRunning()
        ig.storage.loadSlot(saveData, false)
        ig.interact.entries.forEach(e => ig.interact.removeEntry(e))

        const mapName = joinData.mapName
        ig.game.teleport(mapName)

        await new Promise<void>(resolve => {
            const id = setInterval(() => {
                if (ig.game?.maps?.length > 0) {
                    clearInterval(id)
                    resolve()
                }
            }, 30)
        })
        runUpdatePacket(joinData.state.packet)
        if (!ig.game.playerEntity) throw new Error()

        this.socket.on('update', (packet: ToClientUpdatePacket) => {
            runUpdatePacket(packet)
        })

        const self = this
        ig.game.addons.postUpdate.push({
            onPostUpdate() {
                if (!self.isConnected()) return
                const packet = self.updatePacketGather.pop()
                self.socket.emit('update', packet)
            },
        })
    }
}
