import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all LeetCode questions
export const getLeetCodeQuestions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leetcode_questions").collect();
  },
});

// Query to get user progress for all questions
export const getUserProgress = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("user_progress").collect();
  },
});

// Query to get questions with their progress status
export const getQuestionsWithProgress = query({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("leetcode_questions").collect();
    const progress = await ctx.db.query("user_progress").collect();
    
    return questions.map(question => {
      const userProgress = progress.find(p => p.questionId === question._id);
      return {
        ...question,
        status: userProgress?.status || "TODO",
        notes: userProgress?.notes || "",
        startedAt: userProgress?.startedAt,
        completedAt: userProgress?.completedAt,
      };
    });
  },
});

// Mutation to add a new LeetCode question
export const addLeetCodeQuestion = mutation({
  args: {
    title: v.string(),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    category: v.string(),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leetcode_questions", args);
  },
});

// Mutation to update user progress on a question
export const updateUserProgress = mutation({
  args: {
    questionId: v.id("leetcode_questions"),
    status: v.union(v.literal("TODO"), v.literal("IN_PROGRESS"), v.literal("DONE")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingProgress = await ctx.db
      .query("user_progress")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .first();

    const now = Date.now();
    
    if (existingProgress) {
      return await ctx.db.patch(existingProgress._id, {
        status: args.status,
        notes: args.notes,
        startedAt: args.status === "IN_PROGRESS" && !existingProgress.startedAt ? now : existingProgress.startedAt,
        completedAt: args.status === "DONE" ? now : undefined,
      });
    } else {
      return await ctx.db.insert("user_progress", {
        questionId: args.questionId,
        status: args.status,
        notes: args.notes,
        startedAt: args.status === "IN_PROGRESS" ? now : undefined,
        completedAt: args.status === "DONE" ? now : undefined,
      });
    }
  },
});