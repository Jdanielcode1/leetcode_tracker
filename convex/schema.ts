import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // LeetCode questions table
  leetcode_questions: defineTable({
    title: v.string(),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    category: v.string(),
    company: v.optional(v.string()),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
  }),

  // User progress tracking
  user_progress: defineTable({
    questionId: v.id("leetcode_questions"),
    username: v.optional(v.string()), // Track which user this progress belongs to (optional for migration)
    status: v.union(v.literal("TODO"), v.literal("IN_PROGRESS"), v.literal("DONE")),
    notes: v.optional(v.string()),
    timeComplexity: v.optional(v.string()),
    spaceComplexity: v.optional(v.string()),
    complexityNotes: v.optional(v.string()),
    explanation: v.optional(v.string()), // Add explanation field
    topics: v.optional(v.array(v.string())),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  }).index("by_question", ["questionId"])
    .index("by_user_question", ["username", "questionId"])
    .index("by_user", ["username"]),

  // Mock interviews
  mock_interviews: defineTable({
    title: v.string(),
    date: v.number(), // timestamp
    duration: v.number(), // minutes
    participants: v.array(v.string()), // friend names/emails
    questionIds: v.array(v.id("leetcode_questions")),
    notes: v.optional(v.string()),
    status: v.union(v.literal("SCHEDULED"), v.literal("COMPLETED"), v.literal("CANCELLED")),
    meetingLink: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_date", ["date"]),
});
