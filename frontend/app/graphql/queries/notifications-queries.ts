import { gql } from '~/graphql'

export const NOTIFICATIONS_QUERY = gql`
  query {
    notifications {
      notification_id
      title
      type
      read
      metadata
      created_at
    }
    verify_token {
      user_id
      name
      email
      picture
      verified
      created_at
    }
  }
`

export const READ_NOTIFICATIONS_MUTATION = gql`
  mutation {
    read_notifications {
      notification_id
    }
  }
`
