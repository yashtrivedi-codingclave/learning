import dns from 'dns';
import mongoose from 'mongoose';

// Some networks (and Windows) can't resolve "mongodb+srv://" addresses with their default DNS,
// which gives a "querySrv / queryTxt ESERVFAIL" error. Using Google/Cloudflare DNS fixes it.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
};

export default connectDB;
