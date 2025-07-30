import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core'
import { type InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { Server } from '@tus/server'

import { EVENT_NAME, TUS_EVENTS } from '@/modules/tus/constants'
import { InjectTusServer } from '@/modules/tus/decorators'

@Injectable()
export class TusService implements OnModuleInit {
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    @InjectTusServer() private readonly server: Server
  ) {}

  onModuleInit() {
    const port = +this.config.getOrThrow('TUS_PORT')

    this.server.listen(port, () => {
      this.logger.log(`Tus server listening on port ${port}`)
    })

    const instanceWrappers: InstanceWrapper[] = [
      ...this.discoveryService.getControllers(),
      ...this.discoveryService.getProviders()
    ]

    instanceWrappers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper
      if (instance == null || Object.getPrototypeOf(instance) == null) {
        return
      }
      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key: string) => {
          wrapper.isDependencyTreeStatic()
            ? this.lookupEvents(instance, key)
            : this.warnForNonStaticProviders(wrapper, instance, key)
        }
      )
    })
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  lookupEvents(instance: Record<string, Function>, key: string) {
    const methodRef = instance[key]
    const metadata = this.reflector.get(EVENT_NAME, methodRef)

    if (metadata == null) {
      return
    }

    if (metadata === TUS_EVENTS.CUSTOMIZE_RESPONSE) {
      this.server.options.onUploadFinish = methodRef.bind(instance)
    }

    if (metadata === TUS_EVENTS.NAMING_FUNCTION) {
      this.server.options.namingFunction = methodRef.bind(instance)
    }

    this.server.on(metadata, methodRef.bind(instance))
  }

  warnForNonStaticProviders(
    wrapper: InstanceWrapper<any>,
    // eslint-disable-next-line @typescript-eslint/ban-types
    instance: Record<string, Function>,
    key: string
  ) {
    const methodRef = instance[key]
    const metadata = this.reflector.get(EVENT_NAME, methodRef)

    this.logger.warn(
      `Cannot register ${metadata} "${wrapper.name}@${key}" because it is defined in a non static provider.`
    )
  }
}
