import { z } from "zod";

/* ─── Login ─── */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});
export type LoginFormData = z.infer<typeof loginSchema>;

/* ─── Register ─── */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must be under 64 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
    role: z.enum(["candidate", "interviewer"], {
      required_error: "Please select a role",
    }),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: "You must accept the Terms & Privacy Policy" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterFormData = z.infer<typeof registerSchema>;

/* ─── Create Room ─── */
export const createRoomSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),
  candidateEmail: z
    .string()
    .trim()
    .min(1, "Candidate email is required")
    .email("Please enter a valid email address"),
  dateTime: z
    .string()
    .min(1, "Date & time is required")
    .refine(
      (val) => new Date(val) > new Date(),
      "Scheduled time must be in the future"
    ),
  duration: z.enum(["30", "45", "60", "90"], {
    required_error: "Please select a duration",
  }),
  techStack: z
    .string()
    .trim()
    .min(1, "Tech stack is required")
    .max(200, "Tech stack must be under 200 characters"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    required_error: "Please select a difficulty level",
  }),
  problemStatement: z
    .string()
    .trim()
    .min(1, "Problem statement is required")
    .min(10, "Problem statement must be at least 10 characters")
    .max(2000, "Problem statement must be under 2000 characters"),
});
export type CreateRoomFormData = z.infer<typeof createRoomSchema>;

/* ─── Feedback ─── */
export const feedbackSchema = z.object({
  ratings: z.object({
    problemSolving: z.number().min(1).max(5),
    codeQuality: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    efficiency: z.number().min(1).max(5),
  }),
  recommendation: z.enum(["strong_yes", "yes", "no", "strong_no"], {
    required_error: "Please select a recommendation",
  }),
  strengths: z
    .string()
    .trim()
    .min(1, "Strengths are required")
    .min(10, "Please provide at least 10 characters")
    .max(1000, "Strengths must be under 1000 characters"),
  improvements: z
    .string()
    .trim()
    .min(1, "Areas for improvement are required")
    .min(10, "Please provide at least 10 characters")
    .max(1000, "Improvements must be under 1000 characters"),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be under 1000 characters")
    .optional()
    .or(z.literal("")),
});
export type FeedbackFormData = z.infer<typeof feedbackSchema>;

/* ─── Chat Message ─── */
export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(500, "Message must be under 500 characters"),
});
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
