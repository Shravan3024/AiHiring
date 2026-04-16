const { z } = require("zod");

const paginationSchema = {
  query: z.object({
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10)),
    status: z.string().optional(),
    jobId: z.string().optional(),
  }),
};

const decisionSchema = {
  body: z.object({
    application_id: z.number().or(z.string().transform(v => parseInt(v, 10))),
    decision: z.enum(["SHORTLISTED", "REJECTED"]),
  }),
};

module.exports = {
  paginationSchema,
  decisionSchema,
};
