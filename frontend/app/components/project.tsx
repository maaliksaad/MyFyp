import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Link } from '@remix-run/react'
import moment from 'moment'

import { type Project } from '~/graphql'

export const ProjectComponent = (
  project: Pick<
    Project,
    'project_id' | 'name' | 'thumbnail' | 'created_at' | 'scans' | 'slug'
  >
) => {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="project group bg-white shadow-sm flex gap-x-4 rounded-3xl p-6"
    >
      <div className="relative w-[100px] h-[100px] rounded-lg">
        <img
          src={project.thumbnail.url}
          alt={project.name}
          className="object-cover w-full h-full rounded-lg"
        />
        <div className="h-full w-full bg-indigo-600 bg-opacity-30 absolute top-0 left-0 rounded-lg" />
      </div>
      <div className="flex-1">
        <div className="h-full flex flex-col justify-between">
          <div className="flex flex-col">
            <p className="text-gray-500 text-xs">
              {project.scans.length} Scans
            </p>
            <h2 className="text-lg text-gray-800 font-semibold">
              {project.name}
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">
              Created{' '}
              {moment(project.created_at as unknown as string).fromNow()}
            </p>
            <ArrowRightIcon className="text-indigo-600 transition duration-300 ease-in-out h-6 w-6 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}
