import { gql } from '~/graphql'

export const GET_PROJECTS_QUERY = gql`
  query {
    projects {
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
  }
`

export const GET_PROJECT_QUERY = gql`
  query ($id: Int, $slug: String) {
    project(id: $id, slug: $slug) {
      project_id
      name
      slug
      thumbnail {
        file_id
        url
      }
      scans {
        scan_id
        name
        slug
        input_file {
          thumbnail
        }
        status
        created_at
      }
      user {
        name
        picture
      }
    }
    activities(project_slug: $slug) {
      activity_id
      entity
      type
      metadata
      created_at
    }
  }
`

export const CREATE_PROJECT_MUTATION = gql`
  mutation ($name: String!, $thumbnail_id: Int!) {
    create_project(data: { name: $name, thumbnail_id: $thumbnail_id }) {
      project_id
      slug
    }
  }
`

export const UPDATE_PROJECT_MUTATION = gql`
  mutation ($id: Int!, $name: String!) {
    update_project(id: $id, data: { name: $name }) {
      project_id
    }
  }
`

export const DELETE_PROJECT_MUTATION = gql`
  mutation ($id: Int!) {
    delete_project(id: $id) {
      project_id
    }
  }
`
