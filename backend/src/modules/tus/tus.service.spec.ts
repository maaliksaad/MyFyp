import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { type Server } from '@tus/server'

import { TUS_SERVER } from '@/modules/tus/constants'
import { TusService } from '@/modules/tus/tus.service'

describe('TusService', () => {
  let tusService: TusService
  let server: Server
  let logger: Logger
  let reflector: Reflector
  let discoveryService: DiscoveryService
  let metadataScanner: MetadataScanner

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            warn: jest.fn()
          }
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue(3000)
          }
        },
        {
          provide: DiscoveryService,
          useValue: {
            getControllers: jest.fn().mockReturnValue([]),
            getProviders: jest.fn().mockReturnValue([])
          }
        },
        {
          provide: MetadataScanner,
          useValue: {
            scanFromPrototype: jest.fn().mockImplementation((_, __, cb) => cb())
          }
        },
        {
          provide: TUS_SERVER,
          useValue: {
            options: {},
            listen: jest.fn().mockImplementation((_, cb) => cb()),
            on: jest.fn()
          }
        },
        TusService
      ]
    }).compile()

    tusService = module.get<TusService>(TusService)
    server = module.get<Server>(TUS_SERVER)
    reflector = module.get<Reflector>(Reflector)
    logger = module.get<Logger>(Logger)
    discoveryService = module.get<DiscoveryService>(DiscoveryService)
    metadataScanner = module.get<MetadataScanner>(MetadataScanner)
  })

  it('should be defined', () => {
    expect(tusService).toBeDefined()
    expect(server).toBeDefined()
    expect(reflector).toBeDefined()
    expect(logger).toBeDefined()
  })

  describe('onModuleInit', () => {
    it('should listen on the configured port', () => {
      tusService.onModuleInit()

      expect(server.listen).toHaveBeenCalledWith(3000, expect.any(Function))
      expect(logger.log).toHaveBeenCalledWith(
        'Tus server listening on port 3000'
      )
    })

    it('given the instance is null: should not scan', () => {
      const instanceWrappers = [
        {
          instance: null
        }
      ] as any

      jest
        .spyOn(discoveryService, 'getControllers')
        .mockReturnValue(instanceWrappers)
      jest
        .spyOn(discoveryService, 'getProviders')
        .mockReturnValue(instanceWrappers)

      tusService.onModuleInit()

      expect(metadataScanner.scanFromPrototype).not.toBeCalled()
    })

    it('given the instance is not null: should scan', () => {
      const instanceWrappers = [
        {
          instance: {
            onUpload: jest.fn()
          },
          isDependencyTreeStatic: () => true
        },
        {
          instance: {
            onUpload: jest.fn()
          },
          isDependencyTreeStatic: () => false
        }
      ] as any

      jest
        .spyOn(discoveryService, 'getControllers')
        .mockReturnValue(instanceWrappers)
      jest
        .spyOn(discoveryService, 'getProviders')
        .mockReturnValue(instanceWrappers)
      jest.spyOn(reflector, 'get').mockReturnValue(null)

      tusService.onModuleInit()

      expect(metadataScanner.scanFromPrototype).toBeCalled()
    })
  })

  describe('lookupEvents', () => {
    it('given no metadata should return', () => {
      const instance = {
        onUpload: jest.fn()
      }
      const key = 'onUpload'

      jest.spyOn(reflector, 'get').mockReturnValue(null)

      tusService.lookupEvents(instance, key)

      expect(server.on).not.toBeCalled()
    })

    it('should add the method to the server options on CUSTOMIZE_RESPONSE', () => {
      const instance = {
        CUSTOMIZE_RESPONSE: jest.fn()
      }
      const key = 'CUSTOMIZE_RESPONSE'

      jest.spyOn(server, 'on')
      jest.spyOn(reflector, 'get').mockReturnValue('CUSTOMIZE_RESPONSE')

      tusService.lookupEvents(instance, key)

      expect(server.on).toBeCalled()
    })

    it('should add the method to the server options on NAMING_FUNCTION', () => {
      const instance = {
        NAMING_FUNCTION: jest.fn()
      }
      const key = 'NAMING_FUNCTION'

      jest.spyOn(server, 'on')
      jest.spyOn(reflector, 'get').mockReturnValue('NAMING_FUNCTION')

      tusService.lookupEvents(instance, key)

      expect(server.on).toBeCalled()
    })

    it('should add the method to the server on the event', () => {
      const instance = {
        onUpload: jest.fn()
      }
      const key = 'onUpload'

      jest.spyOn(server, 'on')
      jest.spyOn(reflector, 'get').mockReturnValue('upload')

      tusService.lookupEvents(instance, key)

      expect(server.on).toBeCalled()
    })
  })

  describe('warnForNonStaticProviders', () => {
    it('should log a warning', () => {
      const instance = {
        onUpload: jest.fn()
      }
      const key = 'onUpload'

      jest.spyOn(reflector, 'get').mockReturnValue('upload')

      tusService.warnForNonStaticProviders(
        { name: 'Test' } as any,
        instance,
        key
      )

      expect(logger.warn).toBeCalledWith(
        'Cannot register upload "Test@onUpload" because it is defined in a non static provider.'
      )
    })
  })
})
