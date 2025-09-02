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
        timeComplexity: userProgress?.timeComplexity || "",
        spaceComplexity: userProgress?.spaceComplexity || "",
        complexityNotes: userProgress?.complexityNotes || "",
        topics: userProgress?.topics || [],
        startedAt: userProgress?.startedAt,
        completedAt: userProgress?.completedAt,
      };
    });
  },
});

// Query to get a single question with progress by ID
export const getQuestionById = query({
  args: { questionId: v.id("leetcode_questions") },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) return null;
    
    const userProgress = await ctx.db
      .query("user_progress")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .first();
    
    return {
      ...question,
      status: userProgress?.status || "TODO",
      notes: userProgress?.notes || "",
      timeComplexity: userProgress?.timeComplexity || "",
      spaceComplexity: userProgress?.spaceComplexity || "",
      complexityNotes: userProgress?.complexityNotes || "",
      topics: userProgress?.topics || [],
      startedAt: userProgress?.startedAt,
      completedAt: userProgress?.completedAt,
    };
  },
});

// Query to get all unique companies
export const getCompanies = query({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("leetcode_questions").collect();
    const companies = new Set<string>();
    
    questions.forEach(question => {
      if (question.company) {
        companies.add(question.company);
      }
    });
    
    return Array.from(companies).sort();
  },
});

// Mock Interview Functions

// Query to get all mock interviews
export const getMockInterviews = query({
  args: {},
  handler: async (ctx) => {
    const interviews = await ctx.db.query("mock_interviews").withIndex("by_date").collect();
    
    // Get question details for each interview
    const interviewsWithQuestions = await Promise.all(
      interviews.map(async (interview) => {
        const questions = await Promise.all(
          interview.questionIds.map(async (questionId) => {
            return await ctx.db.get(questionId);
          })
        );
        
        return {
          ...interview,
          questions: questions.filter(q => q !== null),
        };
      })
    );
    
    return interviewsWithQuestions;
  },
});

// Query to get mock interviews for a specific date range
export const getMockInterviewsByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const interviews = await ctx.db
      .query("mock_interviews")
      .withIndex("by_date", (q) => 
        q.gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();
    
    // Get question details for each interview
    const interviewsWithQuestions = await Promise.all(
      interviews.map(async (interview) => {
        const questions = await Promise.all(
          interview.questionIds.map(async (questionId) => {
            return await ctx.db.get(questionId);
          })
        );
        
        return {
          ...interview,
          questions: questions.filter(q => q !== null),
        };
      })
    );
    
    return interviewsWithQuestions;
  },
});

// Mutation to create a new mock interview
export const createMockInterview = mutation({
  args: {
    title: v.string(),
    date: v.number(),
    duration: v.number(),
    participants: v.array(v.string()),
    questionIds: v.array(v.id("leetcode_questions")),
    notes: v.optional(v.string()),
    meetingLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mock_interviews", {
      ...args,
      status: "SCHEDULED",
      createdAt: Date.now(),
    });
  },
});

// Mutation to update mock interview status
export const updateMockInterviewStatus = mutation({
  args: {
    interviewId: v.id("mock_interviews"),
    status: v.union(v.literal("SCHEDULED"), v.literal("COMPLETED"), v.literal("CANCELLED")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.interviewId, {
      status: args.status,
      notes: args.notes,
    });
  },
});

// Mutation to delete a mock interview
export const deleteMockInterview = mutation({
  args: { interviewId: v.id("mock_interviews") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.interviewId);
  },
});

// Mutation to add a new LeetCode question
export const addLeetCodeQuestion = mutation({
  args: {
    title: v.string(),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    category: v.string(),
    company: v.optional(v.string()),
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
    timeComplexity: v.optional(v.string()),
    spaceComplexity: v.optional(v.string()),
    complexityNotes: v.optional(v.string()),
    topics: v.optional(v.array(v.string())),
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
        timeComplexity: args.timeComplexity,
        spaceComplexity: args.spaceComplexity,
        complexityNotes: args.complexityNotes,
        topics: args.topics,
        startedAt: args.status === "IN_PROGRESS" && !existingProgress.startedAt ? now : existingProgress.startedAt,
        completedAt: args.status === "DONE" ? now : undefined,
      });
    } else {
      return await ctx.db.insert("user_progress", {
        questionId: args.questionId,
        status: args.status,
        notes: args.notes,
        timeComplexity: args.timeComplexity,
        spaceComplexity: args.spaceComplexity,
        complexityNotes: args.complexityNotes,
        topics: args.topics,
        startedAt: args.status === "IN_PROGRESS" ? now : undefined,
        completedAt: args.status === "DONE" ? now : undefined,
      });
    }
  },
});