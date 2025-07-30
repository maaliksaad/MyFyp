import { Injectable } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { InjectConnection, InjectModel } from '@nestjs/sequelize'
import * as moment from 'moment'
import { Op, Sequelize, Transaction } from 'sequelize'

import { Activity, Project, Scan } from '@/models'
import {
  ProjectActivityEvent,
  ScanActivityEvent
} from '@/modules/activity/events'

@Injectable()
export class ActivityService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(Scan)
    private readonly scanModel: typeof Scan,
    @InjectModel(Activity)
    private readonly activityModel: typeof Activity
  ) {}

  async findAll(
    input: {
      project_slug?: string
      scan_slug?: string
      user_id: number
    },
    transaction: Transaction
  ) {
    const activities = await this.activityModel.findAll({
      where: {
        user_id: input.user_id,
        ...(input.project_slug != null && {
          entity: 'project',
          metadata: {
            project_slug: input.project_slug
          }
        }),
        ...(input.scan_slug != null && {
          entity: 'scan',
          metadata: {
            scan_slug: input.scan_slug
          }
        }),
        ...(input.project_slug == null &&
          input.scan_slug == null && {
            created_at: {
              [Op.gte]: moment().subtract(7, 'days').toDate()
            }
          })
      },
      order: [['created_at', 'DESC']],
      transaction
    })

    return activities.map(activity => activity.toJSON())
  }

  create({
    type,
    event
  }:
    | { type: 'project'; event: ProjectActivityEvent }
    | { type: 'scan'; event: ScanActivityEvent }) {
    this.eventEmitter.emit(`activity.${type}`, event)
  }

  @OnEvent('activity.project')
  async projectEvent(event: ProjectActivityEvent) {
    await this.sequelize.transaction(async t => {
      const project = await this.projectModel.findByPk(event.data.project_id, {
        include: [
          {
            all: true,
            nested: true
          }
        ],
        transaction: t
      })

      if (project == null) {
        return
      }

      await this.activityModel.create(
        {
          entity: 'project',
          type: event.data.type,
          metadata: {
            project_id: project.project_id,
            project_slug: project.slug,
            project_name: project.name,
            project_thumbnail: project.thumbnail.url,
            user_name: project.user.name
          },
          user_id: project.user_id
        },
        {
          transaction: t
        }
      )
    })
  }

  @OnEvent('activity.scan')
  async scanEvent(event: ScanActivityEvent) {
    await this.sequelize.transaction(async t => {
      const scan = await this.scanModel.findByPk(event.data.scan_id, {
        include: [
          {
            all: true,
            nested: true
          }
        ],
        transaction: t
      })

      const project = await this.projectModel.findByPk(scan?.project_id, {
        include: [
          {
            all: true,
            nested: true
          }
        ],
        transaction: t
      })

      if (scan == null || project == null) {
        return
      }

      await this.activityModel.create(
        {
          entity: 'scan',
          type: event.data.type,
          metadata: {
            project_id: project.project_id,
            project_slug: project.slug,
            project_name: project.name,
            project_thumbnail: project.thumbnail.url,
            scan_id: scan.scan_id,
            scan_slug: scan.slug,
            scan_name: scan.name,
            scan_thumbnail: scan.input_file.thumbnail,
            user_name: scan.user.name
          },
          user_id: scan.user_id
        },
        {
          transaction: t
        }
      )
    })
  }
}
