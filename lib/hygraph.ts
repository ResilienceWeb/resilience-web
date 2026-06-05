import { GraphQLClient } from 'graphql-request'

/**
 * Shared Hygraph (GraphCMS) GraphQL client.
 *
 * A single client instance is reused across all callers instead of
 * instantiating a new `GraphQLClient` per request. This keeps request
 * configuration in one place and avoids redundant client setup.
 */
let client: GraphQLClient | null = null

export function getHygraphClient(): GraphQLClient {
  if (!client) {
    client = new GraphQLClient(process.env.GRAPHCMS_URL)
  }

  return client
}
