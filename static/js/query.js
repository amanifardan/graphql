// GraphQL queries
const PROFILE_QUERY = `
  query Profile($userId: Int!) {
    user {
      id
      login
      auditRatio
      totalUp
      totalDown
      TransactionsFiltered1: transactions(where: {type: {_eq: "xp"}, path: { _like: "%bh-module%", _nregex: "^.(piscine-js/|piscine-rust/|piscine-ui/|piscine-ux/)." }}) {
        amount
        type
        path
        createdAt
        objectId
        object {
          id
          name
          type
        }
      }
    }
    level: transaction(
      where: { userId: { _eq: $userId }, type: { _eq: "level" } }
      order_by: { createdAt: desc }
      limit: 1
    ) {
      amount
      path
    }
    result(where: { userId: { _eq: $userId } }) {
      grade
      eventId
      path
      createdAt
    }
  }
`;

window.PROFILE_QUERY = PROFILE_QUERY;