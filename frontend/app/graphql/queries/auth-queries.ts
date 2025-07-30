import { gql } from '~/graphql'

export const LOGIN_MUTATION = gql`
  mutation ($email: String!, $password: String!) {
    login(data: { email: $email, password: $password }) {
      user_id
      name
      email
      picture
      verified
      created_at
      token
    }
  }
`

export const SIGNUP_MUTATION = gql`
  mutation ($name: String!, $email: String!, $password: String!) {
    signup(data: { name: $name, email: $email, password: $password }) {
      verification_id
    }
  }
`

export const VERIFY_TOKEN_QUERY = gql`
  query {
    verify_token {
      user_id
      name
      email
      verified
    }
  }
`

export const VERIFY_ACCOUNT_MUTATION = gql`
  mutation ($id: Int!, $token: String!) {
    verify_account(data: { id: $id, token: $token }) {
      user_id
      name
      email
      picture
      verified
      created_at
      token
    }
  }
`

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ($email: String!) {
    forgot_password(data: { email: $email }) {
      password_reset_id
    }
  }
`

export const RESET_PASSWORD_MUTATION = gql`
  mutation ($id: Int!, $token: String!, $password: String!) {
    reset_password(data: { id: $id, token: $token, password: $password }) {
      password_reset_id
    }
  }
`

export const UPDATE_ACCOUNT_MUTATION = gql`
  mutation ($name: String, $picture: String) {
    update_account(data: { name: $name, picture: $picture }) {
      user_id
      name
      email
      picture
      verified
      created_at
    }
  }
`

export const UPDATE_PASSWORD_MUTATION = gql`
  mutation ($current_password: String!, $new_password: String!) {
    update_password(
      data: { current_password: $current_password, new_password: $new_password }
    ) {
      user_id
    }
  }
`
