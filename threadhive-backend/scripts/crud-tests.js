import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '../src/models/User.js';
import Subreddit from '../src/models/Subreddit.js';
import Thread from '../src/models/Thread.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const testState = {
  userIds: [],
  subredditIds: [],
  threadIds: [],
};

const testResults = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTest(name, fn) {
  const startedAt = Date.now();
  try {
    await fn();
    const elapsedMs = Date.now() - startedAt;
    testResults.push({ name, status: 'PASS', elapsedMs });
    console.log(`[PASS] ${name} (${elapsedMs}ms)`);
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    testResults.push({ name, status: 'FAIL', elapsedMs, error: error.message });
    console.log(`[FAIL] ${name} (${elapsedMs}ms) -> ${error.message}`);
  }
}

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in .env');
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('Connected to MongoDB');
}

async function setupFixtures() {
  const runId = `crud-${Date.now()}`;

  const users = await User.insertMany([
    {
      name: 'Test User One',
      email: `${runId}-user1@example.com`,
      password: 'Pass@1234',
      createdAt: new Date('2026-06-01T10:00:00.000Z'),
    },
    {
      name: 'Test User Two',
      email: `${runId}-user2@example.com`,
      password: 'Pass@1234',
      createdAt: new Date('2026-06-01T10:05:00.000Z'),
    },
    {
      name: 'Test User Three',
      email: `${runId}-user3@example.com`,
      password: 'Pass@1234',
      createdAt: new Date('2026-06-01T10:10:00.000Z'),
    },
  ]);

  testState.userIds = users.map((u) => u._id);

  const subreddits = await Subreddit.insertMany([
    {
      name: `${runId}-subreddit-a`,
      description: 'Fixture subreddit A',
      author: users[0]._id,
      createdAt: new Date('2026-06-01T11:00:00.000Z'),
    },
    {
      name: `${runId}-subreddit-b`,
      description: 'Fixture subreddit B',
      author: users[1]._id,
      createdAt: new Date('2026-06-01T11:05:00.000Z'),
    },
  ]);

  testState.subredditIds = subreddits.map((s) => s._id);

  const threads = await Thread.insertMany([
    {
      title: `${runId}-thread-1`,
      content: 'Fixture thread 1 content',
      author: users[0]._id,
      subreddit: subreddits[0]._id,
      upvotes: 10,
      downvotes: 2,
      voteCount: 8,
      createdAt: new Date('2026-06-01T12:00:00.000Z'),
    },
    {
      title: `${runId}-thread-2`,
      content: 'Fixture thread 2 content',
      author: users[1]._id,
      subreddit: subreddits[0]._id,
      upvotes: 20,
      downvotes: 5,
      voteCount: 15,
      createdAt: new Date('2026-06-01T12:05:00.000Z'),
    },
    {
      title: `${runId}-thread-3`,
      content: 'Fixture thread 3 content',
      author: users[2]._id,
      subreddit: subreddits[1]._id,
      upvotes: 5,
      downvotes: 1,
      voteCount: 4,
      createdAt: new Date('2026-06-01T12:10:00.000Z'),
    },
  ]);

  testState.threadIds = threads.map((t) => t._id);

  return {
    runId,
    users,
    subreddits,
    threads,
  };
}

async function cleanupFixtures(runId) {
  await Thread.deleteMany({
    $or: [
      { _id: { $in: testState.threadIds } },
      { title: { $regex: `^${runId}-` } },
    ],
  });

  await Subreddit.deleteMany({
    $or: [
      { _id: { $in: testState.subredditIds } },
      { name: { $regex: `^${runId}-` } },
    ],
  });

  await User.deleteMany({
    $or: [
      { _id: { $in: testState.userIds } },
      { email: { $regex: `^${runId}-` } },
    ],
  });
}

function printSummary() {
  const passed = testResults.filter((t) => t.status === 'PASS').length;
  const failed = testResults.filter((t) => t.status === 'FAIL').length;

  console.log('\n========================================');
  console.log('CRUD TEST SUMMARY');
  console.log('========================================');
  console.log(`Total Tests: ${testResults.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    for (const test of testResults.filter((t) => t.status === 'FAIL')) {
      console.log(`- ${test.name}: ${test.error}`);
    }
  }

  console.log('========================================\n');

  if (failed > 0) {
    process.exitCode = 1;
  }
}

async function runAllTests() {
  await connectDatabase();
  const fixtures = await setupFixtures();

  const fixtureUserOneId = fixtures.users[0]._id;
  const fixtureUserTwoId = fixtures.users[1]._id;
  const fixtureSubredditOneId = fixtures.subreddits[0]._id;

  // USER CRUD (5 tests)
  await runTest('User Create: create one user', async () => {
    const created = await User.create({
      name: 'Create User',
      email: `${fixtures.runId}-create-user@example.com`,
      password: 'Pass@1234',
      createdAt: new Date('2026-06-02T09:00:00.000Z'),
    });

    assert(created && created._id, 'User creation did not return an _id');
    testState.userIds.push(created._id);
  });

  await runTest('User Read: find by email', async () => {
    const user = await User.findOne({ email: fixtures.users[0].email });
    assert(user, 'User not found by email');
    assert(user.name === 'Test User One', 'User name mismatch');
  });

  await runTest('User Read: count fixture users', async () => {
    const count = await User.countDocuments({
      email: { $regex: `^${fixtures.runId}-user` },
    });
    assert(count === 3, `Expected 3 fixture users, found ${count}`);
  });

  await runTest('User Update: update name', async () => {
    const updated = await User.findByIdAndUpdate(
      fixtureUserOneId,
      { name: 'Test User One Updated' },
      { new: true }
    );
    assert(updated, 'Updated user not returned');
    assert(updated.name === 'Test User One Updated', 'User name was not updated');
  });

  await runTest('User Delete: create and delete', async () => {
    const temp = await User.create({
      name: 'Temp Delete User',
      email: `${fixtures.runId}-delete-user@example.com`,
      password: 'Pass@1234',
      createdAt: new Date('2026-06-02T09:30:00.000Z'),
    });

    const deleted = await User.findByIdAndDelete(temp._id);
    const exists = await User.findById(temp._id);

    assert(deleted, 'Delete operation did not return deleted user');
    assert(!exists, 'User still exists after delete');
  });

  // SUBREDDIT CRUD (5 tests)
  await runTest('Subreddit Create: create one subreddit', async () => {
    const created = await Subreddit.create({
      name: `${fixtures.runId}-create-subreddit`,
      description: 'Created during CRUD test',
      author: fixtureUserTwoId,
      createdAt: new Date('2026-06-02T10:00:00.000Z'),
    });

    assert(created && created._id, 'Subreddit creation failed');
    testState.subredditIds.push(created._id);
  });

  await runTest('Subreddit Read: find by name', async () => {
    const subreddit = await Subreddit.findOne({ name: fixtures.subreddits[0].name });
    assert(subreddit, 'Subreddit not found by name');
    assert(String(subreddit.author) === String(fixtureUserOneId), 'Subreddit author mismatch');
  });

  await runTest('Subreddit Read: list by author', async () => {
    const authored = await Subreddit.find({ author: fixtureUserOneId });
    assert(authored.length >= 1, 'Expected at least one subreddit by author');
  });

  await runTest('Subreddit Update: change description', async () => {
    const updated = await Subreddit.findByIdAndUpdate(
      fixtureSubredditOneId,
      { description: 'Updated fixture subreddit description' },
      { new: true }
    );

    assert(updated, 'Updated subreddit not returned');
    assert(
      updated.description === 'Updated fixture subreddit description',
      'Subreddit description was not updated'
    );
  });

  await runTest('Subreddit Delete: create and delete', async () => {
    const temp = await Subreddit.create({
      name: `${fixtures.runId}-delete-subreddit`,
      description: 'Will be deleted',
      author: fixtureUserTwoId,
      createdAt: new Date('2026-06-02T10:30:00.000Z'),
    });

    const deleted = await Subreddit.findByIdAndDelete(temp._id);
    const exists = await Subreddit.findById(temp._id);

    assert(deleted, 'Delete operation did not return deleted subreddit');
    assert(!exists, 'Subreddit still exists after delete');
  });

  // THREAD CRUD (5 tests)
  await runTest('Thread Create: create one thread', async () => {
    const created = await Thread.create({
      title: `${fixtures.runId}-create-thread`,
      content: 'Thread created during CRUD test',
      author: fixtureUserOneId,
      subreddit: fixtureSubredditOneId,
      upvotes: 4,
      downvotes: 1,
      voteCount: 3,
      createdAt: new Date('2026-06-02T11:00:00.000Z'),
    });

    assert(created && created._id, 'Thread creation failed');
    testState.threadIds.push(created._id);
  });

  await runTest('Thread Read: find by title', async () => {
    const thread = await Thread.findOne({ title: fixtures.threads[0].title });
    assert(thread, 'Thread not found by title');
    assert(thread.voteCount === 8, 'Thread voteCount mismatch');
  });

  await runTest('Thread Read: populate author and subreddit', async () => {
    const thread = await Thread.findById(fixtures.threads[1]._id)
      .populate('author', 'email')
      .populate('subreddit', 'name');

    assert(thread, 'Thread not found by id');
    assert(thread.author && thread.author.email, 'Author population failed');
    assert(thread.subreddit && thread.subreddit.name, 'Subreddit population failed');
  });

  await runTest('Thread Update: vote fields', async () => {
    const updated = await Thread.findByIdAndUpdate(
      fixtures.threads[2]._id,
      {
        upvotes: 9,
        downvotes: 2,
        voteCount: 7,
      },
      { new: true }
    );

    assert(updated, 'Updated thread not returned');
    assert(updated.upvotes === 9, 'upvotes not updated');
    assert(updated.downvotes === 2, 'downvotes not updated');
    assert(updated.voteCount === 7, 'voteCount not updated');
  });

  await runTest('Thread Delete: create and delete', async () => {
    const temp = await Thread.create({
      title: `${fixtures.runId}-delete-thread`,
      content: 'Will be deleted',
      author: fixtureUserOneId,
      subreddit: fixtureSubredditOneId,
      upvotes: 1,
      downvotes: 0,
      voteCount: 1,
      createdAt: new Date('2026-06-02T11:30:00.000Z'),
    });

    const deleted = await Thread.findByIdAndDelete(temp._id);
    const exists = await Thread.findById(temp._id);

    assert(deleted, 'Delete operation did not return deleted thread');
    assert(!exists, 'Thread still exists after delete');
  });

  // CROSS-MODEL CRUD WORKFLOWS (5 tests)
  await runTest('Workflow Create: create user + subreddit + thread chain', async () => {
    const user = await User.create({
      name: 'Workflow User',
      email: `${fixtures.runId}-workflow-user@example.com`,
      password: 'Pass@1234',
      createdAt: new Date('2026-06-02T12:00:00.000Z'),
    });
    testState.userIds.push(user._id);

    const subreddit = await Subreddit.create({
      name: `${fixtures.runId}-workflow-subreddit`,
      description: 'Workflow subreddit',
      author: user._id,
      createdAt: new Date('2026-06-02T12:05:00.000Z'),
    });
    testState.subredditIds.push(subreddit._id);

    const thread = await Thread.create({
      title: `${fixtures.runId}-workflow-thread`,
      content: 'Workflow thread content',
      author: user._id,
      subreddit: subreddit._id,
      upvotes: 3,
      downvotes: 0,
      voteCount: 3,
      createdAt: new Date('2026-06-02T12:10:00.000Z'),
    });
    testState.threadIds.push(thread._id);

    assert(user && subreddit && thread, 'Workflow create chain failed');
  });

  await runTest('Workflow Read: user threads count', async () => {
    const threads = await Thread.find({ author: fixtureUserOneId });
    assert(threads.length >= 1, 'Expected at least one thread by fixture user');
  });

  await runTest('Workflow Read: subreddit thread distribution', async () => {
    const count = await Thread.countDocuments({ subreddit: fixtureSubredditOneId });
    assert(count >= 2, `Expected at least 2 threads in subreddit, found ${count}`);
  });

  await runTest('Workflow Update: move thread to another subreddit', async () => {
    const targetSubreddit = fixtures.subreddits[1]._id;
    const updated = await Thread.findByIdAndUpdate(
      fixtures.threads[0]._id,
      { subreddit: targetSubreddit },
      { new: true }
    );

    assert(updated, 'Thread update for subreddit move failed');
    assert(String(updated.subreddit) === String(targetSubreddit), 'Thread subreddit was not moved');
  });

  await runTest('Workflow Delete: delete subreddit and its threads manually', async () => {
    const tempSubreddit = await Subreddit.create({
      name: `${fixtures.runId}-cascade-delete-subreddit`,
      description: 'Manual cascade delete test',
      author: fixtureUserTwoId,
      createdAt: new Date('2026-06-02T13:00:00.000Z'),
    });

    const t1 = await Thread.create({
      title: `${fixtures.runId}-cascade-thread-1`,
      content: 'Cascade thread 1',
      author: fixtureUserTwoId,
      subreddit: tempSubreddit._id,
      upvotes: 0,
      downvotes: 0,
      voteCount: 0,
      createdAt: new Date('2026-06-02T13:05:00.000Z'),
    });

    const t2 = await Thread.create({
      title: `${fixtures.runId}-cascade-thread-2`,
      content: 'Cascade thread 2',
      author: fixtureUserTwoId,
      subreddit: tempSubreddit._id,
      upvotes: 0,
      downvotes: 0,
      voteCount: 0,
      createdAt: new Date('2026-06-02T13:10:00.000Z'),
    });

    const deleteThreadsResult = await Thread.deleteMany({ subreddit: tempSubreddit._id });
    const deleteSubredditResult = await Subreddit.findByIdAndDelete(tempSubreddit._id);

    const dangling = await Thread.countDocuments({ subreddit: tempSubreddit._id });

    assert(deleteThreadsResult.deletedCount === 2, 'Expected to delete exactly 2 threads');
    assert(deleteSubredditResult, 'Subreddit delete failed');
    assert(dangling === 0, `Expected no dangling threads, found ${dangling}`);

    const removedTrackedIds = new Set([String(t1._id), String(t2._id)]);
    testState.threadIds = testState.threadIds.filter((id) => !removedTrackedIds.has(String(id)));
  });

  await cleanupFixtures(fixtures.runId);
}

async function main() {
  try {
    await runAllTests();
  } catch (error) {
    console.error(`Fatal test runner error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    printSummary();
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
