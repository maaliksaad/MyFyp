import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { getConnectionToken, getModelToken } from '@nestjs/sequelize'
import { Test, type TestingModule } from '@nestjs/testing'
import type { Sequelize } from 'sequelize'

import {
  createPopulatedFile,
  createPopulatedProject,
  createPopulatedUser
} from '@/factories'
import { File, Project, Scan, User } from '@/models'
import { ActivityService } from '@/modules/activity/activity.service'
import { FileService } from '@/modules/file/file.service'
import { NotificationService } from '@/modules/notification/notification.service'
import { ProjectService } from '@/modules/project/project.service'
import { ScanProcessEvent } from '@/modules/scan/events'
import { ScanService } from '@/modules/scan/scan.service'
import { createModelStub } from '@/tests/create-model.stub'
import { createAndSaveScan } from '@/tests/util'

describe('ScanService', () => {
  let scanService: ScanService
  let fileService: FileService
  let scanModel: typeof Scan
  let fileModel: typeof File
  let userModel: typeof User
  let projectModel: typeof Project
  let sequelize: Sequelize
  let httpService: HttpService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...createModelStub(Scan, File, User, Project)],
      providers: [
        ScanService,
        {
          provide: FileService,
          useValue: {
            findById: jest.fn().mockResolvedValue(createPopulatedFile()),
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

    scanService = module.get<ScanService>(ScanService)
    fileService = module.get<FileService>(FileService)
    scanModel = module.get<typeof Scan>(getModelToken(Scan))
    fileModel = module.get<typeof File>(getModelToken(File))
    userModel = module.get<typeof User>(getModelToken(User))
    projectModel = module.get<typeof Project>(getModelToken(Project))
    sequelize = module.get<Sequelize>(getConnectionToken())
    httpService = module.get<HttpService>(HttpService)
  })

  afterEach(async () => {
    await scanModel.destroy({ where: {}, truncate: true })
    await fileModel.destroy({ where: {}, truncate: true })
    await userModel.destroy({ where: {}, truncate: true })
    await projectModel.destroy({ where: {}, truncate: true })
  })

  it('should be defined', () => {
    expect(scanService).toBeDefined()
    expect(fileService).toBeDefined()
    expect(scanModel).toBeDefined()
    expect(fileModel).toBeDefined()
    expect(userModel).toBeDefined()
    expect(projectModel).toBeDefined()
  })

  describe('findAll', () => {
    it('given no scans: should return an empty array', async () => {
      const transaction = await sequelize.transaction()

      const result = await scanService.findAll({ user_id: 1 }, transaction)

      expect(result).toHaveLength(0)
    })

    it('given a user_id: should return all scans of the user', async () => {
      const transaction = await sequelize.transaction()

      const { user, scan } = await createAndSaveScan({
        userModel,
        scanModel,
        projectModel,
        fileModel
      })

      const result = await scanService.findAll(
        { user_id: user.user_id },
        transaction
      )

      expect(result).toMatchObject([scan])
    })
  })

  describe('findOne', () => {
    it('given no data: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      await expect(
        scanService.findOne({ user_id: 1 }, transaction)
      ).rejects.toThrow('id or slug is required')
    })

    it('given an invalid scan_id: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      await expect(
        scanService.findOne(
          {
            scan_id: 1,
            user_id: 1
          },
          transaction
        )
      ).rejects.toThrow('Scan not found')
    })

    it('given a valid scan_id: should return the scan', async () => {
      const transaction = await sequelize.transaction()

      const { user, scan } = await createAndSaveScan({
        userModel,
        scanModel,
        projectModel,
        fileModel
      })

      const result = await scanService.findOne(
        {
          scan_id: scan.scan_id,
          user_id: user.user_id
        },
        transaction
      )

      expect(result).toMatchObject(scan)
    })

    it('given a valid slug: should return the scan', async () => {
      const transaction = await sequelize.transaction()

      const { user, scan } = await createAndSaveScan({
        userModel,
        scanModel,
        projectModel,
        fileModel
      })

      const result = await scanService.findOne(
        {
          slug: scan.slug,
          user_id: user.user_id
        },
        transaction
      )

      expect(result).toMatchObject(scan)
    })
  })

  describe('findPublic', () => {
    it('given no data: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      await expect(scanService.findPublic({}, transaction)).rejects.toThrow(
        'id or slug is required'
      )
    })

    it('given an invalid scan_id: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      await expect(
        scanService.findPublic(
          {
            scan_id: 1
          },
          transaction
        )
      ).rejects.toThrow('Scan not found')
    })

    it('given a valid scan_id: should return the scan', async () => {
      const transaction = await sequelize.transaction()

      const { scan } = await createAndSaveScan({
        userModel,
        scanModel,
        projectModel,
        fileModel
      })

      const result = await scanService.findPublic(
        {
          scan_id: scan.scan_id
        },
        transaction
      )

      expect(result).toMatchObject(scan)
    })

    it('given a valid slug: should return the scan', async () => {
      const transaction = await sequelize.transaction()

      const { scan } = await createAndSaveScan({
        userModel,
        scanModel,
        projectModel,
        fileModel
      })

      const result = await scanService.findPublic(
        {
          slug: scan.slug
        },
        transaction
      )

      expect(result).toMatchObject(scan)
    })
  })

  describe('create', () => {
    it('given an invalid file_id: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser()
      await userModel.create({ ...user })

      jest
        .spyOn(fileService, 'findById')
        .mockRejectedValue(new Error('Invalid file id'))

      await expect(
        scanService.create(
          {
            data: {
              name: 'scan',
              input_file_id: 1,
              project_id: 1
            },
            user
          },
          transaction
        )
      ).rejects.toThrow('Invalid file id')
    })

    it('given valid data and a user: should create a scan', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser()
      await userModel.create({ ...user })

      const file = createPopulatedFile()
      await fileModel.create({ ...file })

      const thumbnail = createPopulatedFile()
      await fileModel.create({ ...thumbnail })

      const project = createPopulatedProject({
        user_id: user.user_id,
        thumbnail_id: thumbnail.file_id
      })
      await projectModel.create({ ...project })

      const result = await scanService.create(
        {
          data: {
            name: 'scan',
            input_file_id: file.file_id,
            project_id: project.project_id
          },
          user
        },
        transaction
      )

      expect(result).toMatchObject({
        scan_id: expect.any(Number),
        name: 'scan',
        slug: 'scan',
        user,
        input_file: file,
        created_at: expect.any(Date)
      })
    })

    it('given a scan with the same name: should create a scan with a different slug', async () => {
      const transaction = await sequelize.transaction()

      const { user, scan, file, project } = await createAndSaveScan({
        userModel,
        scanModel,
        projectModel,
        fileModel
      })

      const result = await scanService.create(
        {
          data: {
            name: scan.name,
            input_file_id: file.file_id,
            project_id: project.project_id
          },
          user
        },
        transaction
      )

      expect(result).toMatchObject({
        project_id: expect.any(Number),
        name: scan.name,
        slug: `${scan.slug}-1`,
        user,
        input_file: file,
        created_at: expect.any(Date)
      })
    })
  })

  describe('update', () => {
    it('given a valid id and data: should update the scan', async () => {
      const transaction = await sequelize.transaction()

      const { user, scan } = await createAndSaveScan({
        userModel,
        scanModel,
        projectModel,
        fileModel
      })

      await scanService.update(
        {
          id: scan.scan_id,
          data: {
            name: 'new name'
          }
        },
        transaction
      )

      const result = await scanService.findOne(
        {
          scan_id: scan.scan_id,
          user_id: user.user_id
        },
        transaction
      )

      expect(result).toMatchObject({
        ...scan,
        name: 'new name'
      })
    })
  })

  describe('delete', () => {
    it('given a valid scan: should delete the scan', async () => {
      const transaction = await sequelize.transaction()

      const { user, scan } = await createAndSaveScan({
        userModel,
        scanModel,
        projectModel,
        fileModel
      })

      scan.input_file = createPopulatedFile()
      scan.splat_file = createPopulatedFile()

      await scanService.delete({ scan }, transaction)

      const result = await scanService.findAll(
        { user_id: user.user_id },
        transaction
      )

      expect(result).toHaveLength(0)
    })
  })

  describe('processScan', () => {
    it('given a valid scan: should process the scan', async () => {
      const { scan, file } = await createAndSaveScan({
        userModel,
        scanModel,
        projectModel,
        fileModel
      })

      await scanService.processScan(
        new ScanProcessEvent({
          scan_id: scan.scan_id,
          input_file: file
        })
      )

      expect(httpService.axiosRef.post).toHaveBeenCalledWith(
        'RUNPOD_PROCESS_URI/run',
        {
          input: {
            key: file.key,
            bucket: file.bucket,
            scan_id: scan.scan_id,
            dataset_type: 'video',
            method: 'gaussian-splatting'
          }
        },
        {
          headers: {
            Authorization: 'Bearer RUNPOD_API_KEY'
          }
        }
      )
    })

    it('given an error: should catch the error', async () => {
      jest
        .spyOn(httpService.axiosRef, 'post')
        .mockRejectedValue(new Error('Scan processing failed'))

      const { scan, file } = await createAndSaveScan({
        userModel,
        scanModel,
        projectModel,
        fileModel
      })

      await expect(
        scanService.processScan(
          new ScanProcessEvent({
            scan_id: scan.scan_id,
            input_file: file
          })
        )
      ).rejects.toThrow('Scan processing failed')
    })
  })
})
