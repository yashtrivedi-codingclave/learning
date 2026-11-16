// Validate req.body against a Zod schema: 400 on failure, otherwise only allowed fields pass through
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success)
    return res.status(400).json({ message: result.error.issues.map((i) => i.message).join(', ') });
  req.body = result.data;
  next();
};
