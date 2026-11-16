// Check req.body with a Zod schema (see validators/index.js).
// Wrong data -> 400 error. Correct data -> only the allowed fields go to the controller.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body || {});

  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  req.body = result.data;
  next();
};
