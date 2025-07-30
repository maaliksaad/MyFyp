import { Injectable } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { InjectConnection, InjectModel } from '@nestjs/sequelize'
import * as moment from 'moment'
import { Op, Sequelize, Transaction } from 'sequelize'

import { Notification } from '@/models'

@Injectable()
export class NotificationService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(Notification)
    private readonly notificationModel: typeof Notification
  ) {}

  async findAll({ user_id }: { user_id: number }, transaction: Transaction) {
    return this.notificationModel.findAll({
      where: {
        user_id,
        created_at: {
          [Op.gte]: moment().subtract(7, 'days').toDate()
        }
      },
      include: [{ all: true, nested: true }],
      order: [['created_at', 'DESC']],
      transaction
    })
  }

  async read({ user_id }: { user_id: number }, transaction: Transaction) {
    await this.notificationModel.update(
      { read: true },
      {
        where: { user_id, read: false },
        transaction
      }
    )

    return this.findAll({ user_id }, transaction)
  }

  send(
    notification: Pick<Notification, 'type' | 'title' | 'metadata' | 'user_id'>
  ) {
    this.eventEmitter.emit('notification.created', notification)
  }

  @OnEvent('notification.created')
  async create(
    payload: Pick<Notification, 'type' | 'title' | 'metadata' | 'user_id'>
  ) {
    await this.sequelize.transaction(async t => {
      await this.notificationModel.create(
        {
          ...payload,
          read: false
        },
        { transaction: t }
      )
    })
  }
}
