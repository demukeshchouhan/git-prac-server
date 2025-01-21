import { GraphQLError } from "graphql";
import { PubSub } from "graphql-subscriptions";
import {
  getJobs,
  getJob,
  getJobsByCompany,
  createJob,
  deleteJob,
  updateJob,
  jobsCount,
} from "../db/jobs.js";
import { getCompany } from "../db/companies.js";
import { createMessage, getMessages } from "../db/messages.js";
import { Resolvers } from "../src/generated/schema.js";

const pubSub = new PubSub();

export const resolvers: Resolvers = {
  Query: {
    jobs: async (_root, { limit, offset }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authorization");
      }
      const items = await getJobs(limit, offset);
      const totalCount = await jobsCount();
      return { items, totalCount };
    },
    job: async (_job, { id }) => {
      const job = await getJob(id);
      if (!job) {
        return notFoundError(`No job found for this id ${id}`);
      }
      return job;
    },
    company: async (_company, { id }) => {
      const company = await getCompany(id);
      if (!company) {
        return notFoundError(`No company found for this id ${id}`);
      }
      return company;
    },
    messages: (_root, _args, { user }) => {
      if (!user) throw unauthorizedError("Missing authorization");
      return getMessages();
    },
  },
  Mutation: {
    createJob: (_root, { input: { title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authorization");
      }
      const { companyId } = user ?? {};
      const job = createJob({ companyId, title, description });
      return job;
    },
    deleteJob: async (_root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authorization");
      }
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        throw notFoundError(`No company found for this id ${id}`);
      }
      return job;
    },
    updateJob: async (
      _root,
      { input: { id, title, description } },
      { user }
    ) => {
      if (!user) {
        throw unauthorizedError("Missing authorization");
      }
      const { companyId } = user;
      const job = await updateJob({ id, companyId, title, description });
      if (!job) {
        throw notFoundError(`No company found for this id ${id}`);
      }
      return job;
    },
    addMessage: async (_root, { text }, { user }) => {
      if (!user) throw unauthorizedError("Missing authorization");
      const message = await createMessage(user.username, text);
      pubSub.publish("MESSAGE_ADDED", { messageAdded: message });
      return message;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: (_root, _args, { user }) => {
        if (!user) throw unauthorizedError("Missing authorization");
        return pubSub.asyncIterableIterator("MESSAGE_ADDED");
      },
    },
  },
  Job: {
    company: (job, _args, { companyLoader }) =>
      companyLoader.load(job.companyId),
    date: (job) => toISODate(job.createdAt),
  },
  Company: {
    jobs: (company) => getJobsByCompany(company.id),
  },
};

function toISODate(value) {
  return value.slice(0, "YYYY-mm-dd".length);
}

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
}

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: "UNAUTHORIZED" },
  });
}
