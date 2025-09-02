import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // LeetCode questions table
  leetcode_questions: defineTable({
    title: v.string(),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    category: v.string(),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
  }),

  // User progress tracking
  user_progress: defineTable({
    questionId: v.id("leetcode_questions"),
    status: v.union(v.literal("TODO"), v.literal("IN_PROGRESS"), v.literal("DONE")),
    notes: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  }).index("by_question", ["questionId"]),
});
