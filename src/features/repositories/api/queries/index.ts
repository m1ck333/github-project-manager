import { gql } from "@apollo/client";

/**
 * Get all repositories for the current viewer
 */
export const GetAllInitialDataDocument = gql`
  query GetAllInitialData {
    viewer {
      repositories(first: 100, affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]) {
        nodes {
          id
          name
          description
          url
          createdAt
          visibility
          isTemplate
          owner {
            login
            avatarUrl
          }
          collaborators(first: 10) {
            edges {
              permission
              node {
                id
                login
                avatarUrl
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Get a specific repository
 */
export const GetRepositoryDocument = gql`
  query GetRepository($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      name
      description
      url
      createdAt
      visibility
      isTemplate
      owner {
        login
        avatarUrl
      }
      collaborators(first: 10) {
        edges {
          permission
          node {
            id
            login
            avatarUrl
          }
        }
      }
    }
  }
`;
