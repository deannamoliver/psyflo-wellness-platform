/**
 * Test user configuration for seed data
 *
 * Defines the special test users that are always created:
 * - counselor@psyflo.com - Test counselor account
 * - student@psyflo.com - Test student account (age 16, grade 10)
 */

export type TestUserConfig = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "counselor" | "student";
  // Student-specific fields
  dateOfBirth?: string;
  age?: number;
  grade?: number;
  gender?: string;
  pronouns?: string;
};

export const TEST_USERS: Record<string, TestUserConfig> = {
  counselor: {
    email: "counselor@psyflo.com",
    password: "password",
    firstName: "Counselor",
    lastName: "Psyflo",
    role: "counselor",
  },
  student: {
    email: "student@psyflo.com",
    password: "password",
    firstName: "Student",
    lastName: "Psyflo",
    role: "student",
    dateOfBirth: "2009-01-01", // 16 years old
    age: 16,
    grade: 10,
    gender: "non_binary",
    pronouns: "they/them",
  },
};
