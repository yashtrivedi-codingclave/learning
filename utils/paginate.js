// Reads ?page=2&limit=10 and returns one page of results (newest first).
// limit is capped at 100 so nobody can fetch the whole collection at once.
export const paginate = async (Model, filter, query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));

  const [data, total] = await Promise.all([
    Model.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Model.countDocuments(filter),
  ]);

  return { data, page, limit, total, pages: Math.ceil(total / limit) };
};
