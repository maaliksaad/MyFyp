import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, type TestingModule } from '@nestjs/testing'

import { createPopulatedNotification, createPopulatedUser } from '@/factories'
import { Notification, User } from '@/models'
import { NotificationResolver } from '@/modules/notification/notification.resolver'
import { NotificationService } from '@/modules/notification/notification.service'
import { createModelStub } from '@/tests/create-model.stub'

describe('NotificationResolver', () => {
  let notificationResolver: NotificationResolver
  let notificationService: NotificationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: createModelStub(User, Notification),
      providers: [
        NotificationResolver,
        NotificationService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn()
          }
        }
      ]
    }).compile()

    notificationResolver =
      module.get<NotificationResolver>(NotificationResolver)
    notificationService = module.get<NotificationService>(NotificationService)
  })

  it('should be defined', () => {
    expect(notificationResolver).toBeDefined()
    expect(notificationService).toBeDefined()
  })

  describe('getNotifications', () => {
    it('should return all notifications', async () => {
      const user = createPopulatedUser()

      const notification = createPopulatedNotification({
        user_id: user.user_id
      })

      jest
        .spyOn(notificationService, 'findAll')
        .mockResolvedValue([notification])

      const result = await notificationResolver.getNotifications(user)

      expect(result).toEqual([notification])
    })
  })

  describe('readNotifications', () => {
    it('should mark a notification as read', async () => {
      const user = createPopulatedUser()

      const notification = createPopulatedNotification({
        user_id: user.user_id
      })

      jest.spyOn(notificationService, 'read').mockResolvedValue([notification])

      const result = await notificationResolver.readNotifications(user)

      expect(result).toEqual([notification])
    })
  })
})
