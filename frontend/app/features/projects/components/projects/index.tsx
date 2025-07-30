import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { Link } from '@remix-run/react'

import { ProjectComponent } from '~/components/project'
import { type Project } from '~/graphql'

export interface ProjectsProperties {
  projects: Project[]
}

export function ProjectsComponent({ projects }: ProjectsProperties) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
      {projects.map(project => (
        <ProjectComponent key={project.project_id} {...project} />
      ))}

      <Link
        to="/projects/create"
        aria-label="Create Project"
        className="bg-white flex flex-col items-center gap-y-2 rounded-3xl px-6 py-4 border border-indigo-200"
      >
        <div className="relative w-12 h-12 rounded-full bg-indigo-200 flex justify-center items-center">
          <span className="animate-ping absolute inline-flex h-3/4 w-3/4 rounded-full bg-indigo-400 opacity-50"></span>
          <PlusCircleIcon className="text-indigo-600 h-7 w-7" />
        </div>

        <div className="flex flex-col text-center">
          <h2 className="text-lg text-gray-800 font-semibold">
            Create Project
          </h2>
          <p className="text-gray-500 text-xs">
            Create a new project to start adding scans
          </p>
        </div>
      </Link>
    </div>
  )
}
