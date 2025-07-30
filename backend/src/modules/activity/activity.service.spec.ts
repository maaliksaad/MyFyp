import { EventEmitter2 } from '@nestjs/event-emitter'
import { getConnectionToken, getModelToken } from '@nestjs/sequelize'
import { Test, type TestingModule } from '@nestjs/testing'
import * as moment from 'moment'
import { type Sequelize } from 'sequelize'

import { createPopulatedActivity, createPopulatedUser } from '@/factories'
import { Activity, File, Project, Scan, User } from '@/models'
import { ActivityService } from '@/modules/activity/activity.service'
import {
  ProjectActivityEvent,
  ScanActivityEvent
} from '@/modules/activity/events'
import { createModelStub } from '@/tests/create-model.stub'
import { createAndSaveProject, createAndSaveScan } from '@/tests/util'

describe('ActivityService', () => {
  let activityService: ActivityService
  let projectModel: typeof Project
  let scanModel: typeof Scan
  let activityModel: typeof Activity
  let userModel: typeof User
  let fileModel: typeof File
  let sequelize: Sequelize
  let eventEmitter: EventEmitter2

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: createModelStub(Project, Scan, Activity, File, User),
      providers: [
        ActivityService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn().mockResolvedValue(null)
          }
        }
      ]
    }).compile()

    activityService = module.get<ActivityService>(ActivityService)
    projectModel = module.get<typeof Project>(getModelToken(Project))
    scanModel = module.get<typeof Scan>(getModelToken(Scan))
    activityModel = module.get<typeof Activity>(getModelToken(Activity))
    userModel = module.get<typeof User>(getModelToken(User))
    fileModel = module.get<typeof File>(getModelToken(File))
    sequelize = module.get<Sequelize>(getConnectionToken())
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  afterEach(async () => {
    await activityModel.destroy({ where: {}, truncate: true })
    await scanModel.destroy({ where: {}, truncate: true })
    await projectModel.destroy({ where: {}, truncate: true })
    await userModel.destroy({ where: {}, truncate: true })
    await fileModel.destroy({ where: {}, truncate: true })
  })

  it('should be defined', () => {
    expect(activityService).toBeDefined()
    expect(projectModel).toBeDefined()
    expect(scanModel).toBeDefined()
    expect(activityModel).toBeDefined()
  })

  describe('findAll', () => {
    it('given a project_slug: should return all activities for that project', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser()
      await userModel.create({ ...user })

      const activity = createPopulatedActivity({
        metadata: {
          project_slug: 'test-project'
        },
        entity: 'project',
        user_id: user.user_id
      })
      await activityModel.create({ ...activity })

      const result = await activityService.findAll(
        {
          user_id: user.user_id,
          project_slug: 'test-project'
        },
        transaction
      )

      expect(result).toHaveLength(1)
      expect(result).toMatchObject([activity])
    })

    it('given a scan_slug: should return all activities for that scan', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser()
      await userModel.create({ ...user })

      const activity = createPopulatedActivity({
        metadata: {
          scan_slug: 'test-scan'
        },
        entity: 'scan',
        user_id: user.user_id
      })
      await activityModel.create({ ...activity })

      const result = await activityService.findAll(
        {
          user_id: user.user_id,
          scan_slug: 'test-scan'
        },
        transaction
      )

      expect(result).toHaveLength(1)
      expect(result).toMatchObject([activity])
    })

    it('given no project_slug or scan_slug: should return activities from the last 7 days', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser()
      await userModel.create({ ...user })

      const activity1 = createPopulatedActivity({
        user_id: user.user_id,
        created_at: moment().subtract(1, 'day').toDate()
      })
      await activityModel.create({ ...activity1 })

      const activity2 = createPopulatedActivity({
        user_id: user.user_id,
        created_at: moment().subtract(2, 'days').toDate()
      })
      await activityModel.create({ ...activity2 })

      const result = await activityService.findAll(
        {
          user_id: user.user_id
        },
        transaction
      )

      expect(result).toHaveLength(2)
      expect(result).toMatchObject([activity1, activity2])
    })
  })

  describe('create', () => {
    it('given valid data: should emit the event', async () => {
      activityService.create({
        type: 'project',
        event: new ProjectActivityEvent({
          project_id: 1,
          type: 'created'
        })
      })

      expect(eventEmitter.emit).toHaveBeenCalled()
    })
  })

  describe('projectEvent', () => {
    it('given a valid project_id: should create a new activity', async () => {
      const { project } = await createAndSaveProject({
        userModel,
        fileModel,
        projectModel
      })

      await activityService.projectEvent(
        new ProjectActivityEvent({
          project_id: project.project_id,
          type: 'created'
        })
      )

      const result = await activityModel.findOne({
        where: {
          entity: 'project',
          type: 'created'
        }
      })

      expect(result).not.toBeNull()
    })

    it('given an invalid project_id: should not create a new activity', async () => {
      await activityService.projectEvent(
        new ProjectActivityEvent({ project_id: 1, type: 'updated' })
      )

      const result = await activityModel.findOne({
        where: {
          entity: 'project',
          type: 'updated'
        }
      })

      expect(result).toBeNull()
    })
  })

  describe('scanEvent', () => {
    it('given a valid scan_id: should create a new activity', async () => {
      const { scan } = await createAndSaveScan({
        userModel,
        fileModel,
        projectModel,
        scanModel
      })

      await activityService.scanEvent(
        new ScanActivityEvent({
          scan_id: scan.scan_id,
          type: 'created'
        })
      )

      const result = await activityModel.findOne({
        where: {
          entity: 'scan',
          type: 'created'
        }
      })

      expect(result).not.toBeNull()
    })

    it('given an invalid scan_id: should not create a new activity', async () => {
      await activityService.scanEvent(
        new ScanActivityEvent({ scan_id: 1, type: 'updated' })
      )

      const result = await activityModel.findOne({
        where: {
          entity: 'scan',
          type: 'updated'
        }
      })

      expect(result).toBeNull()
    })
  })
})
