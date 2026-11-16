import cloudinary from '../config/cloudinary.js';

const notFound = (res) => res.status(404).json({ message: 'Not found' });
// Users can only access their own documents; admins can access all
const mine = (req, filter = {}) =>
  req.user.role === 'admin' ? filter : { ...filter, owner: req.user._id };

// img = name of the image field ('image' for products, 'dp' for users)
export const crud = (Model, img = 'image') => {
  const dropImage = (id) => id && cloudinary.uploader.destroy(id);
  return {
    // ?page=2&limit=10 (limit capped at 100 so nobody can fetch the whole collection at once)
    getAll: async (req, res) => {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
      const filter = mine(req);
      const [data, total] = await Promise.all([
        Model.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Model.countDocuments(filter),
      ]);
      res.json({ data, page, limit, total, pages: Math.ceil(total / limit) });
    },
    getOne: async (req, res) => {
      const doc = await Model.findOne(mine(req, { _id: req.params.id }));
      doc ? res.json(doc) : notFound(res);
    },
    create: async (req, res) =>
      res.status(201).json(await Model.create({ ...req.body, owner: req.user._id })),
    update: async (req, res) => {
      const doc = await Model.findOne(mine(req, { _id: req.params.id }));
      if (!doc) return notFound(res);
      const oldImageId = doc[`${img}Id`];
      const { owner, ...data } = req.body; // owner can never be changed
      await Object.assign(doc, data).save(); // save() runs the password hash hook and validators
      if (data[`${img}Id`]) await dropImage(oldImageId); // new image saved, so delete the old one
      res.json(doc);
    },
    remove: async (req, res) => {
      const doc = await Model.findOneAndDelete(mine(req, { _id: req.params.id }));
      if (!doc) return notFound(res);
      await dropImage(doc[`${img}Id`]);
      res.json({ message: 'Deleted' });
    },
  };
};
