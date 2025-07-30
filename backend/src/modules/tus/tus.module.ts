import { type DynamicModule, Logger, Module } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'
import { type DataStore, Server, type ServerOptions } from '@tus/server'

import { TUS_SERVER } from '@/modules/tus/constants'
import { TusService } from '@/modules/tus/tus.service'

type TusModuleOptions = Pick<ServerOptions, 'path' | 'namingFunction'> & {
  datastore: DataStore
}

@Module({
  imports: [DiscoveryModule]
})
export class TusModule {
  public static forRootAsync({
    imports = [],
    global,
    useFactory,
    inject
  }: {
    imports?: any[]
    global?: boolean
    useFactory: (...args: any[]) => Promise<TusModuleOptions> | TusModuleOptions
    inject?: any[]
  }): DynamicModule {
    return {
      exports: [TUS_SERVER],
      imports: [...imports, DiscoveryModule],
      module: TusModule,
      global,
      providers: [
        Logger,
        {
          provide: TUS_SERVER,
          useFactory: async (...args: any[]) => {
            const options = await useFactory(...args)
            return new Server({
              ...options,
              allowedHeaders: ['file-name', 'file-type']
            })
          },
          inject
        },
        TusService
      ]
    }
  }
}
