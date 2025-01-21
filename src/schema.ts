const typedefs = `#graphql
#regular comment
"""
This is a documentation comment
"""
type Query {
  jobs(limit: Int, offset: Int): JobSubList
  job(id: ID!): Job
  company(id: ID!): Company
  messages: [Message!]
}

type Mutation {
  login(username: String!, password: String!): String
  createJob(input: CreateJobInput!): Job
  updateJob(input: UpdateJobInput!): Job
  deleteJob(id: ID!): Job
  addMessage(text: String!): Message
}

type Subscription {
  messageAdded: Message
}

type Message {
  id: ID!
  user: String!
  text: String!
}

type JobSubList {
  items: [Job!]!
  totalCount: Int!
}

type Company {
  id: ID!
  name: String!
  description: String
  jobs: [Job!]
}

type Job {
  id: ID!
  title: String!
  description: String
  date: String!
  company: Company
}

input CreateJobInput {
  title: String!
  description: String
}

input UpdateJobInput {
  id: ID!
  title: String!
  description: String
}
`;

export default typedefs;
