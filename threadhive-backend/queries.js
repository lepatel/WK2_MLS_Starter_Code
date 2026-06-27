import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from "./src/models/User.js"
import Subreddit from './src/models/Subreddit.js';
import Thread from './src/models/Thread.js';


async function query1() {
    // find user by email diana@example.com
    const user = await User.findOne({ email: 'diana@example.com' });
    console.log("Query 1:", user);
}

async function query2() {
    // Get threads in subreddit programming
    const subreddit = await Subreddit.findOne({ name: 'programming' });
    if (subreddit) {
        const threads = await Thread.find({ subreddit: subreddit._id });
        console.log("Query 2:", threads);
    } else {
        console.log('Subreddit not found');
    }
}

async function query3() {
    // Threads posted by a specific user Ethan
    const user = await User.findOne({ name: 'Ethan' });
    if (user) {
        const threads = await Thread.find({ author: user._id });
        console.log("Query 3:", threads);
    } else {
        console.log('User not found');
    }
}

async function query4() {
    // Users who posted threads
    const threads = await Thread.find().populate('author', 'name email');
    const users = threads.map(thread => thread.author);
    console.log("Query 4:", users);
}

// more queries

async function runQueries() {
    // Uncomment the query you want to run
    await query1();
    await query2();
    await query3();
    await query4();
    // more
}

async function main() {
  try {
    dotenv.config();
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");
    await runQueries();
  } catch (err) {
    console.error("DB connection failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from DB");
  }
}

main();