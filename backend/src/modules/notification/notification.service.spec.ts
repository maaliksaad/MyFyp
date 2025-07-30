import { EventEmitter2 } from '@nestjs/event-emitter'
import { getConnectionToken, getModelToken } from '@nestjs/sequelize'
import { Test, type TestingModule } from '@nestjs/testing'
import { type Sequelize } from 'sequelize'

import { createPopulatedNotification, createPopulatedUser } from '@/factories'
import { Notification, User } from '@/models'
import { NotificationService } from '@/modules/notification/notification.service'
import { createModelStub } from '@/tests/create-model.stub'

describe('NotificationService', () => {
  let notificationService: NotificationService
  let notificationModel: typeof Notification
  let userModel: typeof User
  let sequelize: Sequelize
  let eventEmitter: EventEmitter2

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: createModelStub(User, Notification),
      providers: [
        NotificationService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn()
          }
        }
      ]
    }).compile()

    notificationService = module.get<NotificationService>(NotificationService)
    notificationModel = module.get<typeof Notification>(
      getModelToken(Notification)
    )
    userModel = module.get<typeof User>(getModelToken(User))
    sequelize = module.get<Sequelize>(getConnectionToken())
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  it('should be defined', () => {
    expect(notificationService).toBeDefined()
    expect(notificationModel).toBeDefined()
    expect(userModel).toBeDefined()
  })

  describe('findAll', () => {
    it('given no notifications: should return empty array', async () => {
      const transaction = await sequelize.transaction()

      const result = await notificationService.findAll(
        { user_id: 1 },
        transaction
      )

      expect(result).toEqual([])
    })

    it('given notifications: should return notifications', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser()
      await userModel.create({ ...user })

      const notification = createPopulatedNotification({
        user_id: user.user_id
      })
      await notificationModel.create({ ...notification })

      const result = await notificationService.findAll(
        { user_id: user.user_id },
        transaction
      )

      expect(result).toHaveLength(1)
      expect(result).toMatchObject([notification])
    })
  })

  describe('read', () => {
    it('given notifications: should mark the notifications as read', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser()
      await userModel.create({ ...user })

      const notification = createPopulatedNotification({
        user_id: user.user_id,
        read: false
      })
      await notificationModel.create({ ...notification })

      const result = await notificationService.read(
        { user_id: user.user_id },
        transaction
      )

      expect(result).toHaveLength(1)
      expect(result).toMatchObject([
        {
          ...notification,
          read: true
        }
      ])
    })
  })

  describe('send', () => {
    it('given valid data: should emit the event', async () => {
      const notification = createPopulatedNotification()

      notificationService.send({ ...notification })

      expect(eventEmitter.emit).toHaveBeenCalled()
    })
  })

  describe('create', () => {
    it('given valid data: should create the notification', async () => {
      const notification = createPopulatedNotification()

      await notificationService.create({ ...notification })

      const result = await notificationModel.findAll()

      expect(result).toHaveLength(1)
    })
  })
})
