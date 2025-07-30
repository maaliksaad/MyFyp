import { gql } from '~/graphql'

export const GET_SCAN_QUERY = gql`
  query ($scanSlug: String, $projectSlug: String) {
    scan(slug: $scanSlug) {
      scan_id
      name
      slug
      status
      input_file {
        file_id
        name
        url
        type
        thumbnail
      }
      user {
        user_id
        name
        picture
      }
      created_at
    }
    project(slug: $projectSlug) {
      project_id
      name
      slug
    }
    activities(scan_slug: $scanSlug) {
      activity_id
      entity
      type
      metadata
      created_at
    }
  }
`

export const CREATE_SCAN_MUTATION = gql`
  mutation ($name: String!, $input_file_id: Int!, $project_id: Int!) {
    create_scan(
      data: {
        name: $name
        input_file_id: $input_file_id
        project_id: $project_id
      }
    ) {
      scan_id
    }
  }
`

export const UPDATE_SCAN_MUTATION = gql`
  mutation ($id: Int!, $name: String!) {
    update_scan(id: $id, data: { name: $name }) {
      scan_id
    }
  }
`

export const DELETE_SCAN_MUTATION = gql`
  mutation ($id: Int!) {
    delete_scan(id: $id) {
      scan_id
    }
  }
`
