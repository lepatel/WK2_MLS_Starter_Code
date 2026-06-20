import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Subreddit from '../models/Subreddit.js';
import Thread from '../models/Thread.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

function assertUniqueIds(records, label, globalIds) {
  const local = new Set();

  for (const record of records) {
    const id = String(record._id || '');
    if (!id) {
      throw new Error(`${label} contains a record without _id.`);
    }
    if (local.has(id)) {
      throw new Error(`${label} has duplicate _id: ${id}`);
    }
    if (globalIds.has(id)) {
      throw new Error(`Duplicate _id across files: ${id}`);
    }

    local.add(id);
    globalIds.add(id);
  }
}

function assertReferences(users, subreddits, threads) {
  const userIds = new Set(users.map((u) => String(u._id)));
  const subredditIds = new Set(subreddits.map((s) => String(s._id)));

  for (const subreddit of subreddits) {
    const authorId = String(subreddit.author);
    if (!userIds.has(authorId)) {
      throw new Error(`Subreddit ${subreddit.name} references missing user: ${authorId}`);
    }
  }

  for (const thread of threads) {
    const authorId = String(thread.author);
    const subredditId = String(thread.subreddit);

    if (!userIds.has(authorId)) {
      throw new Error(`Thread ${thread.title} references missing user: ${authorId}`);
    }

    if (!subredditIds.has(subredditId)) {
      throw new Error(`Thread ${thread.title} references missing subreddit: ${subredditId}`);
    }
  }
}

async function readJsonFile(fileName) {
  const filePath = path.join(dataDir, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`${fileName} must contain a JSON array.`);
  }

  return parsed;
}

async function connectDatabase() {
  dotenv.config({ path: path.join(rootDir, '.env') });

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in .env');
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('Connected to MongoDB');
}

async function clearCollections() {
  console.log('Clearing existing collections...');
  await Thread.deleteMany({});
  await Subreddit.deleteMany({});
  await User.deleteMany({});
  console.log('Existing data removed');
}

async function seedCollections(users, subreddits, threads) {
  console.log(`Inserting users (${users.length})...`);
  await User.insertMany(users, { ordered: true });

  console.log(`Inserting subreddits (${subreddits.length})...`);
  await Subreddit.insertMany(subreddits, { ordered: true });

  console.log(`Inserting threads (${threads.length})...`);
  await Thread.insertMany(threads, { ordered: true });
}

async function main() {
  try {
    const users = await readJsonFile('users.json');
    const subreddits = await readJsonFile('subreddits.json');
    const threads = await readJsonFile('threads.json');

    const allIds = new Set();
    assertUniqueIds(users, 'users.json', allIds);
    assertUniqueIds(subreddits, 'subreddits.json', allIds);
    assertUniqueIds(threads, 'threads.json', allIds);
    assertReferences(users, subreddits, threads);

    await connectDatabase();
    await clearCollections();
    await seedCollections(users, subreddits, threads);

    const [userCount, subredditCount, threadCount] = await Promise.all([
      User.countDocuments(),
      Subreddit.countDocuments(),
      Thread.countDocuments(),
    ]);

    console.log('Seed completed successfully');
    console.log(`Users: ${userCount}, Subreddits: ${subredditCount}, Threads: ${threadCount}`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

main();
