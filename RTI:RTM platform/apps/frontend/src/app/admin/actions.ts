"use server";

import {
  adminEvals,
  adminPrompts,
  adminTestCases,
  adminTestMessages,
  type NewAdminEval,
  type NewAdminPrompt,
  type NewAdminTestCase,
  type NewAdminTestMessage,
  schoolDomains,
  schools,
  screenerFrequencySettings,
} from "@feelwell/database";
import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";
import { serverSupabase } from "@/lib/database/supabase";
import { generateResponse, judgeConversation } from "./evals/judge/gemini";

// Helper function to check admin access
async function checkAdminAccess() {
  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email?.endsWith("@psyflo.com")) {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

// Get all prompts
export async function getPromptsAction() {
  await checkAdminAccess();

  const db = await serverDrizzle();
  const prompts = await db.admin.query.adminPrompts.findMany({
    where: isNull(adminPrompts.deletedAt),
    orderBy: (prompts, { desc, asc }) => [
      desc(prompts.isActive),
      asc(prompts.name),
    ],
  });

  return prompts;
}

// Get active prompt
export async function getActivePromptAction() {
  await checkAdminAccess();

  const db = await serverDrizzle();
  const activePrompt = await db.admin.query.adminPrompts.findFirst({
    where: and(eq(adminPrompts.isActive, true), isNull(adminPrompts.deletedAt)),
  });

  return activePrompt;
}

// Create new prompt
export async function createPromptAction(data: {
  name: string;
  content: string;
  description?: string;
  type?: "system" | "user_guidance" | "safety_response";
}) {
  const user = await checkAdminAccess();

  const db = await serverDrizzle();

  const newPrompt: NewAdminPrompt = {
    name: data.name,
    content: data.content,
    description: data.description,
    type: data.type || "system",
    isActive: false,
    createdBy: user.id,
  };

  const [prompt] = await db.admin
    .insert(adminPrompts)
    .values(newPrompt)
    .returning();

  revalidatePath("/admin/prompt");
  return prompt;
}

// Update prompt
export async function updatePromptAction(
  id: string,
  data: {
    name?: string;
    content?: string;
    description?: string;
  },
) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  const prompt = await db.admin.query.adminPrompts.findFirst({
    where: and(eq(adminPrompts.id, id), isNull(adminPrompts.deletedAt)),
  });

  if (!prompt) {
    notFound();
  }

  const [updatedPrompt] = await db.admin
    .update(adminPrompts)
    .set(data)
    .where(eq(adminPrompts.id, id))
    .returning();

  revalidatePath("/admin/prompt");
  return updatedPrompt;
}

// Set active prompt (deactivates all others)
export async function setActivePromptAction(id: string) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  const prompt = await db.admin.query.adminPrompts.findFirst({
    where: and(eq(adminPrompts.id, id), isNull(adminPrompts.deletedAt)),
  });

  if (!prompt) {
    notFound();
  }

  // First deactivate all prompts
  await db.admin
    .update(adminPrompts)
    .set({ isActive: false })
    .where(isNull(adminPrompts.deletedAt));

  // Then activate the selected prompt
  const [activePrompt] = await db.admin
    .update(adminPrompts)
    .set({ isActive: true })
    .where(eq(adminPrompts.id, id))
    .returning();

  revalidatePath("/admin/prompt");
  revalidatePath("/admin/judge"); // Judge tab may depend on active prompt
  return activePrompt;
}

// Delete prompt (soft delete)
export async function deletePromptAction(id: string) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  const prompt = await db.admin.query.adminPrompts.findFirst({
    where: and(eq(adminPrompts.id, id), isNull(adminPrompts.deletedAt)),
  });

  if (!prompt) {
    notFound();
  }

  await db.admin
    .update(adminPrompts)
    .set({ deletedAt: new Date() })
    .where(eq(adminPrompts.id, id));

  revalidatePath("/admin/prompt");
  return { success: true };
}

// === TEST CASE ACTIONS ===

// Get all test cases
export async function getTestCasesAction() {
  await checkAdminAccess();

  const db = await serverDrizzle();
  const testCases = await db.admin
    .select()
    .from(adminTestCases)
    .where(isNull(adminTestCases.deletedAt))
    .orderBy(adminTestCases.name);

  return testCases;
}

// Get all test cases with last message role for warning indicators
export async function getTestCasesWithLastMessageAction() {
  await checkAdminAccess();

  const db = await serverDrizzle();
  const testCases = await db.admin
    .select()
    .from(adminTestCases)
    .where(isNull(adminTestCases.deletedAt))
    .orderBy(adminTestCases.name);

  // For each test case, get the last message to determine if it ends with assistant message
  const testCasesWithLastMessage = await Promise.all(
    testCases.map(async (testCase) => {
      const lastMessage = await db.admin
        .select({ role: adminTestMessages.role })
        .from(adminTestMessages)
        .where(
          and(
            eq(adminTestMessages.testCaseId, testCase.id),
            isNull(adminTestMessages.deletedAt),
          ),
        )
        .orderBy(desc(adminTestMessages.sequenceOrder))
        .limit(1)
        .then((results) => results[0]);

      return {
        ...testCase,
        endsWithAssistantMessage: lastMessage?.role === "assistant",
      };
    }),
  );

  return testCasesWithLastMessage;
}

// Get test case with messages
export async function getTestCaseWithMessagesAction(id: string) {
  await checkAdminAccess();

  const db = await serverDrizzle();
  const testCase = await db.admin
    .select()
    .from(adminTestCases)
    .where(and(eq(adminTestCases.id, id), isNull(adminTestCases.deletedAt)))
    .limit(1)
    .then((results) => results[0]);

  if (!testCase) {
    return null;
  }

  const messages = await db.admin
    .select()
    .from(adminTestMessages)
    .where(
      and(
        eq(adminTestMessages.testCaseId, id),
        isNull(adminTestMessages.deletedAt),
      ),
    )
    .orderBy(adminTestMessages.sequenceOrder);

  return { ...testCase, messages };
}

// Create new test case
export async function createTestCaseAction(data: {
  name: string;
  description?: string;
  category?: string;
}) {
  const user = await checkAdminAccess();

  const db = await serverDrizzle();

  const newTestCase: NewAdminTestCase = {
    name: data.name,
    description: data.description,
    category: data.category,
    createdBy: user.id,
  };

  const [testCase] = await db.admin
    .insert(adminTestCases)
    .values(newTestCase)
    .returning();

  revalidatePath("/admin/tests");
  return testCase;
}

// Update test case
export async function updateTestCaseAction(
  id: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
  },
) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  const testCase = await db.admin.query.adminTestCases.findFirst({
    where: and(eq(adminTestCases.id, id), isNull(adminTestCases.deletedAt)),
  });

  if (!testCase) {
    notFound();
  }

  const [updatedTestCase] = await db.admin
    .update(adminTestCases)
    .set(data)
    .where(eq(adminTestCases.id, id))
    .returning();

  revalidatePath("/admin/tests");
  return updatedTestCase;
}

// Delete test case (soft delete)
export async function deleteTestCaseAction(id: string) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  const testCase = await db.admin.query.adminTestCases.findFirst({
    where: and(eq(adminTestCases.id, id), isNull(adminTestCases.deletedAt)),
  });

  if (!testCase) {
    notFound();
  }

  // Soft delete test case and all its messages
  await db.admin
    .update(adminTestCases)
    .set({ deletedAt: new Date() })
    .where(eq(adminTestCases.id, id));

  await db.admin
    .update(adminTestMessages)
    .set({ deletedAt: new Date() })
    .where(eq(adminTestMessages.testCaseId, id));

  revalidatePath("/admin/tests");
  return { success: true };
}

// Bulk import test cases from JSON
export async function bulkImportTestCasesAction(
  testCases: Array<{
    name: string;
    description?: string;
    category?: string;
    messages: Array<{
      role: "user" | "assistant";
      content: string;
    }>;
  }>,
) {
  const user = await checkAdminAccess();
  const db = await serverDrizzle();

  const results: Array<{ name: string; success: boolean; error?: string }> = [];

  for (const testCase of testCases) {
    try {
      // Create the test case
      const [createdTestCase] = await db.admin
        .insert(adminTestCases)
        .values({
          name: testCase.name,
          description: testCase.description,
          category: testCase.category,
          createdBy: user.id,
        })
        .returning();

      if (!createdTestCase) {
        throw new Error("Failed to create test case");
      }

      // Add messages with sequence order
      if (testCase.messages && testCase.messages.length > 0) {
        const messagesWithOrder = testCase.messages.map((msg, index) => ({
          testCaseId: createdTestCase.id,
          role: msg.role,
          content: msg.content,
          sequenceOrder: index,
        }));

        await db.admin.insert(adminTestMessages).values(messagesWithOrder);
      }

      results.push({ name: testCase.name, success: true });
    } catch (error) {
      results.push({
        name: testCase.name,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  revalidatePath("/admin/tests");
  return results;
}

// === TEST MESSAGE ACTIONS ===

// Add message to test case
export async function addTestMessageAction(data: {
  testCaseId: string;
  role: "user" | "assistant";
  content: string;
}) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  // Get current max sequence order
  const maxOrder = await db.admin
    .select()
    .from(adminTestMessages)
    .where(
      and(
        eq(adminTestMessages.testCaseId, data.testCaseId),
        isNull(adminTestMessages.deletedAt),
      ),
    )
    .orderBy(desc(adminTestMessages.sequenceOrder))
    .limit(1)
    .then((results) => results[0]);

  const nextOrder = (maxOrder?.sequenceOrder ?? -1) + 1;

  const newMessage: NewAdminTestMessage = {
    testCaseId: data.testCaseId,
    role: data.role,
    content: data.content,
    sequenceOrder: nextOrder,
  };

  const [message] = await db.admin
    .insert(adminTestMessages)
    .values(newMessage)
    .returning();

  revalidatePath("/admin/tests");
  return message;
}

// Update test message
export async function updateTestMessageAction(
  id: string,
  data: {
    content?: string;
    role?: "user" | "assistant";
  },
) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  const message = await db.admin.query.adminTestMessages.findFirst({
    where: and(
      eq(adminTestMessages.id, id),
      isNull(adminTestMessages.deletedAt),
    ),
  });

  if (!message) {
    notFound();
  }

  const [updatedMessage] = await db.admin
    .update(adminTestMessages)
    .set(data)
    .where(eq(adminTestMessages.id, id))
    .returning();

  revalidatePath("/admin/tests");
  return updatedMessage;
}

// Delete test message
export async function deleteTestMessageAction(id: string) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  const message = await db.admin.query.adminTestMessages.findFirst({
    where: and(
      eq(adminTestMessages.id, id),
      isNull(adminTestMessages.deletedAt),
    ),
  });

  if (!message) {
    notFound();
  }

  await db.admin
    .update(adminTestMessages)
    .set({ deletedAt: new Date() })
    .where(eq(adminTestMessages.id, id));

  // Reorder remaining messages to fill the gap
  const remainingMessages = await db.admin
    .select()
    .from(adminTestMessages)
    .where(
      and(
        eq(adminTestMessages.testCaseId, message.testCaseId),
        isNull(adminTestMessages.deletedAt),
      ),
    )
    .orderBy(adminTestMessages.sequenceOrder);

  // Update sequence orders to be consecutive
  for (let i = 0; i < remainingMessages.length; i++) {
    const message = remainingMessages[i];
    if (message && message.sequenceOrder !== i) {
      await db.admin
        .update(adminTestMessages)
        .set({ sequenceOrder: i })
        .where(eq(adminTestMessages.id, message.id));
    }
  }

  revalidatePath("/admin/tests");
  return { success: true };
}

// Reorder test messages
export async function reorderTestMessagesAction(
  _testCaseId: string,
  messageIds: string[],
) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  // Update sequence orders based on the new order
  for (let i = 0; i < messageIds.length; i++) {
    const messageId = messageIds[i];
    if (messageId) {
      await db.admin
        .update(adminTestMessages)
        .set({ sequenceOrder: i })
        .where(eq(adminTestMessages.id, messageId));
    }
  }

  revalidatePath("/admin/tests");
  return { success: true };
}

// === EVAL ACTIONS ===

// Get all evals
export async function getEvalsAction() {
  await checkAdminAccess();

  const db = await serverDrizzle();
  const evals = await db.admin
    .select()
    .from(adminEvals)
    .where(isNull(adminEvals.deletedAt))
    .orderBy(adminEvals.name);

  return evals;
}

// Create new eval
export async function createEvalAction(data: {
  name: string;
  description: string;
}) {
  const user = await checkAdminAccess();

  const db = await serverDrizzle();

  const newEval: NewAdminEval = {
    name: data.name,
    description: data.description,
    createdBy: user.id,
  };

  const [eval_] = await db.admin.insert(adminEvals).values(newEval).returning();

  revalidatePath("/admin/evals");
  return eval_;
}

// Update eval
export async function updateEvalAction(
  id: string,
  data: {
    name?: string;
    description?: string;
  },
) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  const eval_ = await db.admin.query.adminEvals.findFirst({
    where: and(eq(adminEvals.id, id), isNull(adminEvals.deletedAt)),
  });

  if (!eval_) {
    notFound();
  }

  const [updatedEval] = await db.admin
    .update(adminEvals)
    .set(data)
    .where(eq(adminEvals.id, id))
    .returning();

  revalidatePath("/admin/evals");
  return updatedEval;
}

// Delete eval (soft delete)
export async function deleteEvalAction(id: string) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  const eval_ = await db.admin.query.adminEvals.findFirst({
    where: and(eq(adminEvals.id, id), isNull(adminEvals.deletedAt)),
  });

  if (!eval_) {
    notFound();
  }

  await db.admin
    .update(adminEvals)
    .set({ deletedAt: new Date() })
    .where(eq(adminEvals.id, id));

  revalidatePath("/admin/evals");
  return { success: true };
}

// === JUDGE ACTIONS ===

// Evaluate single test case against selected evaluation criteria
export async function evaluateSingleTestCaseAction(
  testCaseId: string,
  evalIds: string[],
) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  // Get selected evaluations
  if (evalIds.length === 0) {
    throw new Error("No evaluation criteria selected");
  }

  const evals = [];
  for (const evalId of evalIds) {
    const evalData = await db.admin
      .select()
      .from(adminEvals)
      .where(and(eq(adminEvals.id, evalId), isNull(adminEvals.deletedAt)));
    evals.push(...evalData);
  }

  // Get the specific test case with its messages
  const testCase = await db.admin
    .select()
    .from(adminTestCases)
    .where(
      and(eq(adminTestCases.id, testCaseId), isNull(adminTestCases.deletedAt)),
    )
    .limit(1)
    .then((results) => results[0]);

  if (!testCase) {
    throw new Error("Test case not found");
  }

  const messages = await db.admin
    .select()
    .from(adminTestMessages)
    .where(
      and(
        eq(adminTestMessages.testCaseId, testCaseId),
        isNull(adminTestMessages.deletedAt),
      ),
    )
    .orderBy(adminTestMessages.sequenceOrder);

  try {
    const judgeResult = await judgeConversation(messages, evals);
    return {
      testCase,
      scores: judgeResult,
      success: true,
    };
  } catch (error) {
    console.error(`Failed to judge test case ${testCase.name}:`, error);
    return {
      testCase,
      scores: {},
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Evaluate all test cases against selected evaluation criteria
export async function evaluateTestCasesAction(evalIds: string[]) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  // Get selected evaluations
  if (evalIds.length === 0) {
    throw new Error("No evaluation criteria selected");
  }

  const evals = [];
  for (const evalId of evalIds) {
    const evalData = await db.admin
      .select()
      .from(adminEvals)
      .where(and(eq(adminEvals.id, evalId), isNull(adminEvals.deletedAt)));
    evals.push(...evalData);
  }

  // Get all test cases with their messages
  const testCases = await db.admin
    .select()
    .from(adminTestCases)
    .where(isNull(adminTestCases.deletedAt))
    .orderBy(adminTestCases.name);

  const results = [];

  for (const testCase of testCases) {
    const messages = await db.admin
      .select()
      .from(adminTestMessages)
      .where(
        and(
          eq(adminTestMessages.testCaseId, testCase.id),
          isNull(adminTestMessages.deletedAt),
        ),
      )
      .orderBy(adminTestMessages.sequenceOrder);

    try {
      const judgeResult = await judgeConversation(messages, evals);
      results.push({
        testCase,
        scores: judgeResult,
        success: true,
      });
    } catch (error) {
      console.error(`Failed to judge test case ${testCase.name}:`, error);
      results.push({
        testCase,
        scores: {},
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

// Test current active prompt against selected test case
export async function testCurrentPromptAction(
  testCaseId: string,
  evalIds: string[],
) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  // Get active prompt
  const activePrompt = await db.admin.query.adminPrompts.findFirst({
    where: and(eq(adminPrompts.isActive, true), isNull(adminPrompts.deletedAt)),
  });

  if (!activePrompt) {
    throw new Error("No active prompt found");
  }

  // Get test case with messages
  const testCase = await db.admin
    .select()
    .from(adminTestCases)
    .where(
      and(eq(adminTestCases.id, testCaseId), isNull(adminTestCases.deletedAt)),
    )
    .limit(1)
    .then((results) => results[0]);

  if (!testCase) {
    throw new Error("Test case not found");
  }

  const messages = await db.admin
    .select()
    .from(adminTestMessages)
    .where(
      and(
        eq(adminTestMessages.testCaseId, testCaseId),
        isNull(adminTestMessages.deletedAt),
      ),
    )
    .orderBy(adminTestMessages.sequenceOrder);

  // Get selected evaluations
  if (evalIds.length === 0) {
    throw new Error("No evaluation criteria selected");
  }

  const evals = [];
  for (const evalId of evalIds) {
    const evalData = await db.admin
      .select()
      .from(adminEvals)
      .where(and(eq(adminEvals.id, evalId), isNull(adminEvals.deletedAt)));
    evals.push(...evalData);
  }

  try {
    // Generate AI response using current active prompt
    const generatedResponse = await generateResponse(
      activePrompt.content,
      messages,
    );

    // Check if response indicates a transfer
    const isTransfer =
      generatedResponse.includes("TRANSFER") ||
      generatedResponse.includes("activate_sub_agent");

    if (isTransfer) {
      // Skip judging for transfer responses
      return {
        testCase,
        activePrompt,
        generatedResponse,
        scores: {},
        success: true,
        isTransfer: true,
      };
    }

    // Create full conversation including the generated response
    const fullConversation = [
      ...messages,
      {
        id: "generated",
        testCaseId,
        role: "assistant" as const,
        content: generatedResponse,
        sequenceOrder: messages.length,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    // Judge the full conversation
    const judgeResult = await judgeConversation(fullConversation, evals);

    return {
      testCase,
      activePrompt,
      generatedResponse,
      scores: judgeResult,
      success: true,
      isTransfer: false,
    };
  } catch (error) {
    console.error(
      `Failed to test prompt on test case ${testCase.name}:`,
      error,
    );
    return {
      testCase,
      activePrompt,
      generatedResponse: null,
      scores: {},
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// === SCHOOL MANAGEMENT ACTIONS ===

// Get all schools with their domains
export async function getSchoolsAction() {
  await checkAdminAccess();

  const db = await serverDrizzle();
  const schoolsList = await db.admin.query.schools.findMany({
    where: isNull(schools.deletedAt),
    with: {
      domains: {
        where: isNull(schoolDomains.deletedAt),
      },
    },
    orderBy: (schools, { asc }) => [asc(schools.name)],
  });

  return schoolsList;
}

// Create new school with domain
export async function createSchoolAction(data: {
  name: string;
  address: string;
  email: string;
  domain: string;
}) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  // Normalize domain to lowercase for consistency
  const normalizedDomain = data.domain.toLowerCase().trim();

  // Validate domain format (basic validation)
  if (!normalizedDomain || !normalizedDomain.includes(".")) {
    throw new Error("Invalid domain format");
  }

  // Validate that contact email domain matches the school domain
  const contactDomain = data.email.split("@")[1]?.toLowerCase();
  if (!contactDomain) {
    throw new Error("Invalid email format");
  }

  if (contactDomain !== normalizedDomain) {
    throw new Error(
      `Contact email must be from the school domain: ${normalizedDomain}`,
    );
  }

  // Check if domain already exists (using normalized domain)
  const existingDomain = await db.admin.query.schoolDomains.findFirst({
    where: and(
      eq(schoolDomains.domain, normalizedDomain),
      isNull(schoolDomains.deletedAt),
    ),
  });

  if (existingDomain) {
    throw new Error("This domain is already associated with another school");
  }

  // Create school
  const [school] = await db.admin
    .insert(schools)
    .values({
      name: data.name,
      address: data.address,
      email: data.email.toLowerCase().trim(),
    })
    .returning();

  if (!school) {
    throw new Error("Failed to create school");
  }

  // Create school domain (using normalized domain)
  await db.admin.insert(schoolDomains).values({
    schoolId: school.id,
    domain: normalizedDomain,
  });

  revalidatePath("/admin/schools/manage");
  revalidatePath("/admin/schools/signup-controls");
  return school;
}

// Update school (domain cannot be changed)
export async function updateSchoolAction(
  schoolId: string,
  data: {
    name: string;
    address: string;
    email: string;
  },
) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  const school = await db.admin.query.schools.findFirst({
    where: and(eq(schools.id, schoolId), isNull(schools.deletedAt)),
    with: {
      domains: true,
    },
  });

  if (!school) {
    notFound();
  }

  // Validate that contact email domain matches one of the school's domains
  const contactDomain = data.email.split("@")[1]?.toLowerCase();
  if (!contactDomain) {
    throw new Error("Invalid email format");
  }

  const activeDomains = school.domains
    .filter((d) => !d.deletedAt)
    .map((d) => d.domain.toLowerCase());

  if (!activeDomains.includes(contactDomain)) {
    throw new Error(
      `Contact email must be from one of the school's domains: ${activeDomains.join(", ")}`,
    );
  }

  const [updatedSchool] = await db.admin
    .update(schools)
    .set({
      name: data.name,
      address: data.address,
      email: data.email.toLowerCase().trim(),
    })
    .where(eq(schools.id, schoolId))
    .returning();

  revalidatePath("/admin/schools/manage");
  revalidatePath("/admin/schools/signup-controls");
  return updatedSchool;
}

// Soft delete school
export async function deleteSchoolAction(schoolId: string) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  const school = await db.admin.query.schools.findFirst({
    where: and(eq(schools.id, schoolId), isNull(schools.deletedAt)),
  });

  if (!school) {
    notFound();
  }

  // Soft delete school
  await db.admin
    .update(schools)
    .set({ deletedAt: new Date() })
    .where(eq(schools.id, schoolId));

  // Also soft delete associated domains
  await db.admin
    .update(schoolDomains)
    .set({ deletedAt: new Date() })
    .where(eq(schoolDomains.schoolId, schoolId));

  revalidatePath("/admin/schools/manage");
  revalidatePath("/admin/schools/signup-controls");
  return { success: true };
}

// Add domain to existing school
export async function addSchoolDomainAction(schoolId: string, domain: string) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  // Normalize domain to lowercase for consistency
  const normalizedDomain = domain.toLowerCase().trim();

  // Validate domain format (basic validation)
  if (!normalizedDomain || !normalizedDomain.includes(".")) {
    throw new Error("Invalid domain format");
  }

  // Check if school exists
  const school = await db.admin.query.schools.findFirst({
    where: and(eq(schools.id, schoolId), isNull(schools.deletedAt)),
  });

  if (!school) {
    throw new Error("School not found");
  }

  // Check if domain already exists (using normalized domain)
  const existingDomain = await db.admin.query.schoolDomains.findFirst({
    where: and(
      eq(schoolDomains.domain, normalizedDomain),
      isNull(schoolDomains.deletedAt),
    ),
  });

  if (existingDomain) {
    throw new Error("This domain is already associated with another school");
  }

  // Add new domain
  await db.admin.insert(schoolDomains).values({
    schoolId,
    domain: normalizedDomain,
  });

  revalidatePath("/admin/schools/manage");
  revalidatePath("/admin/schools/signup-controls");
  return { success: true };
}

// Remove domain from school
export async function removeSchoolDomainAction(domainId: string) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  // Get the domain to check if it's the last one
  const domain = await db.admin.query.schoolDomains.findFirst({
    where: and(eq(schoolDomains.id, domainId), isNull(schoolDomains.deletedAt)),
  });

  if (!domain) {
    throw new Error("Domain not found");
  }

  // Check if this is the last domain for the school
  const schoolDomainsCount = await db.admin.query.schoolDomains.findMany({
    where: and(
      eq(schoolDomains.schoolId, domain.schoolId),
      isNull(schoolDomains.deletedAt),
    ),
  });

  if (schoolDomainsCount.length <= 1) {
    throw new Error("Cannot remove the last domain from a school");
  }

  // Soft delete the domain
  await db.admin
    .update(schoolDomains)
    .set({ deletedAt: new Date() })
    .where(eq(schoolDomains.id, domainId));

  revalidatePath("/admin/schools/manage");
  revalidatePath("/admin/schools/signup-controls");
  return { success: true };
}

// === SCREENER FREQUENCY SETTINGS ACTIONS ===

// Get all screener frequency settings
export async function getScreenerFrequencySettingsAction() {
  await checkAdminAccess();

  const db = await serverDrizzle();
  const settings = await db.admin.query.screenerFrequencySettings.findMany({
    orderBy: (settings, { asc }) => [asc(settings.screenerType)],
  });

  return settings;
}

// Update screener frequency setting
export async function updateScreenerFrequencyAction(
  screenerType: "sel" | "phq_a" | "phq_9" | "gad_child" | "gad_7",
  frequency: "monthly" | "quarterly" | "annually",
) {
  await checkAdminAccess();

  const db = await serverDrizzle();

  // Check if setting exists
  const existing = await db.admin.query.screenerFrequencySettings.findFirst({
    where: eq(screenerFrequencySettings.screenerType, screenerType),
  });

  if (existing) {
    // Update existing
    const [updated] = await db.admin
      .update(screenerFrequencySettings)
      .set({ frequency })
      .where(eq(screenerFrequencySettings.screenerType, screenerType))
      .returning();

    revalidatePath("/admin/screeners/frequency");
    return updated;
  } else {
    // Create new (shouldn't happen, but handle it)
    const [created] = await db.admin
      .insert(screenerFrequencySettings)
      .values({
        screenerType,
        frequency,
      })
      .returning();

    revalidatePath("/admin/screeners/frequency");
    return created;
  }
}
