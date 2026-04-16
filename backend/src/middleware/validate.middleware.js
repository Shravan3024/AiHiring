const { z } = require("zod");

/**
 * Higher-order middleware to validate request data against a Zod schema.
 * Supports validating 'body', 'query', and 'params'.
 */
const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = {};

    if (schema.body) {
      validatedData.body = schema.body.parse(req.body);
      req.body = validatedData.body; // Replace with cleaned/validated data
    }

    if (schema.query) {
      validatedData.query = schema.query.parse(req.query);
      req.query = validatedData.query;
    }

    if (schema.params) {
      validatedData.params = schema.params.parse(req.params);
      req.params = validatedData.params;
    }

    next();
  } catch (error) {
    if (error.name === "ZodError" || error instanceof z.ZodError) {
      const issues = error.issues || error.errors || [];
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

module.exports = validate;
