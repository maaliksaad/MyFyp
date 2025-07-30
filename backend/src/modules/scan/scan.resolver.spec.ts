import { faker } from '@faker-js/faker'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, type TestingModule } from '@nestjs/testing'

import {
  createPopulatedFile,
  createPopulatedProject,
  createPopulatedScan,
  createPopulatedUser
} from '@/factories'
import { File, Project, Scan, User } from '@/models'
import { ActivityService } from '@/modules/activity/activity.service'
import { FileService } from '@/modules/file/file.service'
import { NotificationService } from '@/modules/notification/notification.service'
import { ProjectService } from '@/modules/project/project.service'
import { ScanResolver } from '@/modules/scan/scan.resolver'
import { ScanService } from '@/modules/scan/scan.service'
import { createModelStub } from '@/tests/create-model.stub'

describe('ScanResolver', () => {
  let scanResolver: ScanResolver
  let scanService: ScanService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...createModelStub(Scan, File, User, Project)],
      providers: [
        ScanResolver,
        ScanService,
        {
          provide: FileService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(createPopulatedFile()),
            delete: jest.fn().mockResolvedValue(null)
          }
        },
        {
          provide: ProjectService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(createPopulatedProject())
          }
        },
        {
          provide: NotificationService,
          useValue: {
            send: jest.fn()
          }
        },
        {
          provide: ActivityService,
          useValue: {
            create: jest.fn().mockResolvedValue(null)
          }
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockImplementation((key: string) => key)
          }
        },
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              post: jest.fn().mockResolvedValue(null)
            }
          }
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn().mockResolvedValue(null)
          }
        }
      ]
    }).compile()

    scanResolver = module.get<ScanResolver>(ScanResolver)
    scanService = module.get<ScanService>(ScanService)
  })

  it('should be defined', () => {
    expect(scanResolver).toBeDefined()
    expect(scanService).toBeDefined()
  })

  describe('findAll', () => {
    it('should return all scans', async () => {
      const user = createPopulatedUser()

      const scan = createPopulatedScan({
        user_id: user.user_id
      })
      jest.spyOn(scanService, 'findAll').mockResolvedValue([scan])

      const result = await scanResolver.findAll(user)

      expect(result).toMatchObject([scan])
    })
  })

  describe('findOne', () => {
    it('given an invalid scan_id: should throw exception', async () => {
      const user = createPopulatedUser()

      jest.spyOn(scanService, 'findOne').mockRejectedValue('Scan not found')

      await expect(scanResolver.findOne(user, 1)).rejects.toEqual(
        'Scan not found'
      )
    })

    it('given a valid scan_id: should return the scan', async () => {
      const user = createPopulatedUser()
      const scan = createPopulatedScan({
        user_id: user.user_id
      })

      jest.spyOn(scanService, 'findOne').mockResolvedValue(scan)

      const result = await scanResolver.findOne(user, scan.scan_id)

      expect(result).toMatchObject(scan)
    })
  })

  describe('findPublicScan', () => {
    it('given an invalid scan_id: should throw exception', async () => {
      jest.spyOn(scanService, 'findPublic').mockRejectedValue('Scan not found')

      await expect(scanResolver.findPublicScan(1)).rejects.toEqual(
        'Scan not found'
      )
    })

    it('given a valid scan_id: should return the scan', async () => {
      const user = createPopulatedUser()
      const scan = createPopulatedScan({
        user_id: user.user_id
      })

      jest.spyOn(scanService, 'findPublic').mockResolvedValue(scan)

      const result = await scanResolver.findPublicScan(scan.scan_id)

      expect(result).toMatchObject(scan)
    })
  })

  describe('createScan', () => {
    it('given valid data and a user: should create a scan', async () => {
      const user = createPopulatedUser()
      const file = createPopulatedFile()

      const scan = createPopulatedScan({ user_id: user.user_id })

      scan.input_file = file

      jest.spyOn(scanService, 'create').mockResolvedValue(scan)

      const result = await scanResolver.createScan(user, {
        name: scan.name,
        project_id: scan.project_id,
        input_file_id: file.file_id
      })

      expect(result).toMatchObject(scan)
    })
  })

  describe('updateScan', () => {
    it('given an invalid scan_id: should throw exception', async () => {
      const user = createPopulatedUser()

      jest.spyOn(scanService, 'findOne').mockRejectedValue('Scan not found')

      await expect(
        scanResolver.updateScan(user, 1, {
          name: faker.lorem.words()
        })
      ).rejects.toEqual('Scan not found')
    })

    it('given valid data and a user: should update the scan', async () => {
      const user = createPopulatedUser()
      const scan = createPopulatedScan({
        user_id: user.user_id
      })

      const data = {
        name: faker.lorem.words()
      }

      jest.spyOn(scanService, 'findOne').mockResolvedValue(scan)

      const result = await scanResolver.updateScan(user, scan.scan_id, data)

      expect(result).toMatchObject(scan)
    })
  })

  describe('deleteScan', () => {
    it('given an invalid scan_id: should throw exception', async () => {
      const user = createPopulatedUser()

      jest.spyOn(scanService, 'findOne').mockRejectedValue('Scan not found')

      await expect(scanResolver.deleteScan(user, 1)).rejects.toEqual(
        'Scan not found'
      )
    })

    it('given a valid scan_id: should delete the scan', async () => {
      const user = createPopulatedUser()
      const scan = createPopulatedScan({
        user_id: user.user_id
      })

      jest.spyOn(scanService, 'findOne').mockResolvedValue(scan)
      jest.spyOn(scanService, 'delete').mockResolvedValue()

      const result = await scanResolver.deleteScan(user, scan.scan_id)

      expect(result).toMatchObject(scan)
    })
  })
})
