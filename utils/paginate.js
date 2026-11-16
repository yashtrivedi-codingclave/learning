// Returns one page of results, newest first.
// Example: ?page=2&limit=10  ->  skip the first 10, return the next 10
export const paginate = async (Model, filter, query) => {
  let page = Number(query.page) || 1;
  let limit = Number(query.limit) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100; // nobody can fetch the whole collection at once

  const skip = (page - 1) * limit;

  const data = await Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await Model.countDocuments(filter);

  return { data, page, limit, total, pages: Math.ceil(total / limit) };
};
