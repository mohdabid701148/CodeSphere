import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const doc = await mongoose.connection.db.collection('platformstats').findOne({ platform: 'leetcode' });
  if (doc) {
    console.log('User Leetcode history item:', doc.history?.[0]);
  }

  const cfDoc = await mongoose.connection.db.collection('platformstats').findOne({ platform: 'codeforces' });
  if (cfDoc) {
    console.log('User Codeforces history item:', cfDoc.history?.[0]);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
