import { gql } from '~/graphql'

export const GET_STATS_QUERY = gql`
  query {
    recent_projects: projects(limit: 3) {
      project_id
      name
      slug
      thumbnail {
        file_id
        name
        url
      }
      scans {
        scan_id
      }
      created_at
    }
    projects {
      project_id
    }
    scans {
      scan_id
    }
    activities {
      activity_id
      entity
      type
      metadata
      created_at
    }
  }
`
