import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, type TestingModule } from '@nestjs/testing'

import { createPopulatedActivity, createPopulatedUser } from '@/factories'
import { Activity, File, Project, Scan, User } from '@/models'
import { ActivityResolver } from '@/modules/activity/activity.resolver'
import { ActivityService } from '@/modules/activity/activity.service'
import { createModelStub } from '@/tests/create-model.stub'

describe('ActivityResolver', () => {
  let activityResolver: ActivityResolver
  let activityService: ActivityService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: createModelStub(Project, Scan, Activity, File, User),
      providers: [
        ActivityResolver,
        ActivityService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn().mockResolvedValue(null)
          }
        }
      ]
    }).compile()

    activityResolver = module.get<ActivityResolver>(ActivityResolver)
    activityService = module.get<ActivityService>(ActivityService)
  })

  it('should be defined', () => {
    expect(activityResolver).toBeDefined()
    expect(activityService).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of activities', async () => {
      const activities = [createPopulatedActivity()]

      jest.spyOn(activityService, 'findAll').mockResolvedValue(activities)

      const user = createPopulatedUser()

      const result = await activityResolver.findAll(user)

      expect(result).toBe(activities)
    })
  })
})
