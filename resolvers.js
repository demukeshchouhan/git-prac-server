import { GraphQLError } from "graphql";
import {
  getJobs,
  getJob,
  getJobsByCompany,
  createJob,
  deleteJob,
  updateJob,
} from "./db/jobs.js";
import { getCompany } from "./db/companies.js";

export const resolvers = {
  Query: {
    jobs: () => getJobs(),
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
  },
  Mutation: {
    createJob: (_root, { input: { title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authorization");
      }
      const { companyId } = user;
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
      { user: { companyId } }
    ) => {
      if (!user) {
        throw unauthorizedError("Missing authorization");
      }
      const job = await updateJob({ id, companyId, title, description });
      if (!job) {
        throw notFoundError(`No company found for this id ${id}`);
      }
      return job;
    },
  },
  Job: {
    company: (job, _args, { companyLoader }) =>
      companyLoader.loader(job.companyId),
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
    extension: { code: "NOT_FOUND" },
  });
}

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extension: { code: "UNAUTHORIZED" },
  });
}
