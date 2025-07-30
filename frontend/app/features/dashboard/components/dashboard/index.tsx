import { Link } from '@remix-run/react'
import moment from 'moment'
import { twMerge } from 'tailwind-merge'

import { ProjectComponent } from '~/components/project'
import { type Activity, type Project } from '~/graphql'

export interface DashboardProperties {
  stats: Array<{
    name: string
    value: string
  }>
  activities: Activity[]
  projects: Project[]
}

export function DashboardComponent({
  stats,
  activities,
  projects
}: DashboardProperties) {
  return (
    <div className="">
      <div className="relative isolate overflow-hidden pt-8">
        <div className="border-b border-b-gray-900/10 lg:border-t lg:border-t-gray-900/5">
          <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
            {stats.map((stat, statIndex) => (
              <div
                key={stat.name}
                className={twMerge(
                  statIndex % 2 === 1
                    ? 'sm:border-l'
                    : statIndex === 2
                      ? 'lg:border-l'
                      : '',
                  'flex items-baseline flex-wrap justify-between gap-y-2 gap-x-4 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8'
                )}
              >
                <dt className="text-sm font-medium leading-6 text-gray-500">
                  {stat.name}
                </dt>
                <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          className="absolute left-0 top-full -z-10 mt-96 origin-top-left translate-y-40 -rotate-90 transform-gpu opacity-20 blur-3xl sm:left-1/2 sm:-ml-96 sm:-mt-10 sm:translate-y-0 sm:rotate-0 sm:transform-gpu sm:opacity-50"
          aria-hidden="true"
        >
          <div
            className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
            style={{
              clipPath:
                'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)'
            }}
          />
        </div>
      </div>

      <div className="space-y-16 py-16 xl:space-y-20">
        <div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mx-auto max-w-2xl text-base font-semibold leading-6 text-gray-900 lg:mx-0 lg:max-w-none">
              Recent activity
            </h2>
          </div>
          <div className="mt-6 overflow-hidden border-t border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                <table className="w-full text-left">
                  <thead className="sr-only">
                    <tr>
                      <th>Amount</th>
                      <th className="hidden sm:table-cell">Scans</th>
                      <th>More details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map(activity => (
                      <tr key={activity.activity_id}>
                        <td className="relative py-5 pr-6">
                          <div className="flex gap-x-6">
                            <div className="flex-auto">
                              <div className="flex items-start gap-x-3">
                                <p className="text-sm font-medium leading-6 text-gray-900">
                                  {activity.entity === 'scan'
                                    ? activity.metadata.scan_name
                                    : activity.metadata.project_name}{' '}
                                  -{' '}
                                  <span className="capitalize">
                                    {activity.entity}
                                  </span>
                                </p>
                              </div>
                              <div className="mt-1 text-xs leading-5 text-gray-500">
                                {moment(
                                  activity.created_at as unknown as string
                                ).fromNow()}
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                          <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                        </td>
                        <td className="hidden py-5 pr-6 sm:table-cell">
                          <div className="mt-1 text-xs leading-5 text-gray-500">
                            {activity.entity === 'scan' ? 'Project' : ''}
                          </div>
                          <div className="text-sm leading-6 text-indigo-600">
                            {activity.entity === 'scan'
                              ? activity.metadata.project_name
                              : ''}
                          </div>
                        </td>
                        <td className="py-5 text-right">
                          <div className="flex justify-end">
                            <Link
                              to={
                                activity.entity === 'scan'
                                  ? `/projects/${activity.metadata.project_slug}/scans/${activity.metadata.scan_slug}`
                                  : `/projects/${activity.metadata.project_slug}`
                              }
                              className="text-sm font-medium leading-6 text-indigo-600 hover:text-indigo-500"
                            >
                              View {activity.entity}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Recent projects
              </h2>
              <Link
                to="/projects"
                className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                View all<span className="sr-only">, projects</span>
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
              {projects.map(project => (
                <ProjectComponent key={project.project_id} {...project} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
