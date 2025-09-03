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

// Query to get questions with multi-user progress status
export const getQuestionsWithProgress = query({
  args: { currentUser: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const questions = await ctx.db.query("leetcode_questions").collect();
    const allProgress = await ctx.db.query("user_progress").collect();
    
    return questions.map(question => {
      // Get current user's progress
      const userProgress = args.currentUser ? allProgress.find(p => 
        p.questionId === question._id && (p.username === args.currentUser || (!p.username && args.currentUser))
      ) : null;
      
      // Get all users' progress for this question
      const allUsersProgress = allProgress.filter(p => p.questionId === question._id);
      
      // Get users who completed this question
      const completedByUsers = allUsersProgress
        .filter(p => p.status === "DONE")
        .map(p => ({
          username: p.username || "legacy_user",
          completedAt: p.completedAt,
          notes: p.notes,
          timeComplexity: p.timeComplexity,
          spaceComplexity: p.spaceComplexity,
          explanation: p.explanation,
        }));
      
      return {
        ...question,
        // Current user's status
        status: userProgress?.status || "TODO",
        notes: userProgress?.notes || "",
        timeComplexity: userProgress?.timeComplexity || "",
        spaceComplexity: userProgress?.spaceComplexity || "",
        complexityNotes: userProgress?.complexityNotes || "",
        explanation: userProgress?.explanation || "",
        topics: userProgress?.topics || [],
        startedAt: userProgress?.startedAt,
        completedAt: userProgress?.completedAt,
        // Multi-user data
        completedByUsers,
        totalCompletions: completedByUsers.length,
        allUsersProgress: allUsersProgress.map(p => ({
          username: p.username || "legacy_user",
          status: p.status,
          notes: p.notes,
          completedAt: p.completedAt,
        })),
      };
    });
  },
});

// Query to get a single question with multi-user progress by ID
export const getQuestionById = query({
  args: { 
    questionId: v.id("leetcode_questions"),
    currentUser: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) return null;
    
    // Get current user's progress
    const userProgress = args.currentUser ? await ctx.db
      .query("user_progress")
      .withIndex("by_user_question", (q) => 
        q.eq("username", args.currentUser).eq("questionId", args.questionId)
      )
      .first() : null;
    
    // Get all users' progress for this question
    const allUsersProgress = await ctx.db
      .query("user_progress")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();
    
    // Get users who completed this question with their contributions
    const completedByUsers = allUsersProgress
      .filter(p => p.status === "DONE")
      .map(p => ({
        username: p.username || "legacy_user",
        completedAt: p.completedAt,
        notes: p.notes,
        timeComplexity: p.timeComplexity,
        spaceComplexity: p.spaceComplexity,
        explanation: p.explanation,
        complexityNotes: p.complexityNotes,
      }));
    
    return {
      ...question,
      // Current user's progress
      status: userProgress?.status || "TODO",
      notes: userProgress?.notes || "",
      timeComplexity: userProgress?.timeComplexity || "",
      spaceComplexity: userProgress?.spaceComplexity || "",
      complexityNotes: userProgress?.complexityNotes || "",
      explanation: userProgress?.explanation || "",
      topics: userProgress?.topics || [],
      startedAt: userProgress?.startedAt,
      completedAt: userProgress?.completedAt,
      // Multi-user data
      completedByUsers,
      totalCompletions: completedByUsers.length,
      allUsersProgress: allUsersProgress.map(p => ({
        username: p.username || "legacy_user",
        status: p.status,
        notes: p.notes,
        completedAt: p.completedAt,
        timeComplexity: p.timeComplexity,
        spaceComplexity: p.spaceComplexity,
        explanation: p.explanation,
      })),
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

// Mutation to update user progress on a question (multi-user)
export const updateUserProgress = mutation({
  args: {
    questionId: v.id("leetcode_questions"),
    username: v.string(),
    status: v.union(v.literal("TODO"), v.literal("IN_PROGRESS"), v.literal("DONE")),
    notes: v.optional(v.string()),
    timeComplexity: v.optional(v.string()),
    spaceComplexity: v.optional(v.string()),
    complexityNotes: v.optional(v.string()),
    explanation: v.optional(v.string()),
    topics: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existingProgress = await ctx.db
      .query("user_progress")
      .withIndex("by_user_question", (q) => 
        q.eq("username", args.username).eq("questionId", args.questionId)
      )
      .first();

    const now = Date.now();
    
    if (existingProgress) {
      return await ctx.db.patch(existingProgress._id, {
        status: args.status,
        notes: args.notes,
        timeComplexity: args.timeComplexity,
        spaceComplexity: args.spaceComplexity,
        complexityNotes: args.complexityNotes,
        explanation: args.explanation,
        topics: args.topics,
        startedAt: args.status === "IN_PROGRESS" && !existingProgress.startedAt ? now : existingProgress.startedAt,
        completedAt: args.status === "DONE" ? now : undefined,
      });
    } else {
      return await ctx.db.insert("user_progress", {
        questionId: args.questionId,
        username: args.username,
        status: args.status,
        notes: args.notes,
        timeComplexity: args.timeComplexity,
        spaceComplexity: args.spaceComplexity,
        complexityNotes: args.complexityNotes,
        explanation: args.explanation,
        topics: args.topics,
        startedAt: args.status === "IN_PROGRESS" ? now : undefined,
        completedAt: args.status === "DONE" ? now : undefined,
      });
    }
  },
});

// Migration function to add username to existing user_progress records
export const migrateUserProgress = mutation({
  args: { defaultUsername: v.string() },
  handler: async (ctx, args) => {
    const progressRecords = await ctx.db.query("user_progress").collect();
    let updatedCount = 0;
    
    for (const record of progressRecords) {
      if (!record.username) {
        await ctx.db.patch(record._id, {
          username: args.defaultUsername
        });
        updatedCount++;
      }
    }
    
    return { 
      message: `Migration completed. Updated ${updatedCount} records with username: ${args.defaultUsername}`,
      totalRecords: progressRecords.length,
      updatedRecords: updatedCount
    };
  },
});