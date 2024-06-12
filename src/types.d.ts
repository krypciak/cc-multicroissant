import { Mod } from 'ultimate-crosscode-typedefs/modloader/mod'
import { Client } from './client'

export type Mod1 = Mod & {
    isCCModPacked: boolean
    findAllAssets?(): void /* only there for ccl2, used to set isCCL3 */
} & (
        | {
              isCCL3: true
              id: string
              findAllAssets(): void
          }
        | {
              isCCL3: false
              name: string
              filemanager: {
                  findFiles(dir: string, exts: string[]): Promise<string[]>
              }
              getAsset(path: string): string
              runtimeAssets: Record<string, string>
          }
    )

declare global {
    var client: Client
    
    namespace ig {
        interface Game {
            pausedVirtual: boolean
        }
    }
}
