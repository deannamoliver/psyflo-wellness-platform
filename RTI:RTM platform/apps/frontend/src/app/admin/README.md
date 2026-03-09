# Admin Evaluation Framework

A comprehensive system for testing, evaluating, and optimizing AI prompts using automated evaluation criteria and test conversations.

## Overview

The Admin Evaluation Framework consists of four interconnected tabs that enable systematic prompt optimization:

1. **Prompt** - Manage system prompts
2. **Tests** - Create test conversations
3. **Evals** - Define evaluation criteria
4. **Judge** - Run AI evaluations

## Architecture

### Core Components

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Prompt    │    │    Tests    │    │    Evals    │    │    Judge    │
│             │    │             │    │             │    │             │
│ • Create    │    │ • Create    │    │ • Create    │    │ • Evaluate  │
│ • Edit      │──▶ │ • Edit      │──▶ │ • Edit      │──▶ │ • Test      │
│ • Activate  │    │ • Manage    │    │ • Manage    │    │ • Compare   │
│ • Delete    │    │ • Delete    │    │ • Delete    │    │ • Analyze   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Technology Stack

- **Frontend**: Next.js 15.5.0 with React 19.1.0
- **Backend**: Server Actions with Drizzle ORM
- **AI**: Google Gemini 2.5 Flash API
- **Database**: PostgreSQL with Supabase
- **UI**: Tailwind CSS v4 with Radix UI components

## Tab 1: Prompt Management

### Purpose

Manage system prompts that define AI behavior, with the ability to activate different prompts for testing.

### Features

- **CRUD Operations**: Create, read, update, delete prompts
- **Active Prompt System**: Only one prompt can be active at a time
- **Inline Title Editing**: Click to rename prompt titles
- **Content Editing**: Full-featured text editor for prompt content
- **Soft Delete**: Prompts are marked as deleted, not physically removed

### Key Files

- `prompt/prompt-manager.tsx` - Main UI component
- `actions.ts` - Server actions (createPromptAction, updatePromptAction, etc.)

### Database Schema

```sql
adminPrompts {
  id: string (UUID)
  name: string
  description: string (optional)
  content: text
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp (nullable)
}
```

### Usage

1. Create prompts with descriptive names
2. Set one prompt as active for testing
3. Edit content and titles inline
4. Only active prompts are used by other admin tools

## Tab 2: Test Management

### Purpose

Create and manage conversation scenarios to test prompts against real student interactions.

### Features

- **Conversation Builder**: Add user/assistant message pairs
- **Category Organization**: Group tests by topic (Academic Support, etc.)
- **Message Editing**: Inline editing of individual messages
- **Sequence Management**: Proper ordering of conversation flow
- **Test Case CRUD**: Full lifecycle management

### Key Files

- `tests/test-manager.tsx` - Main UI component
- `tests/test-conversation.tsx` - Individual conversation display

### Database Schema

```sql
adminTestCases {
  id: string (UUID)
  name: string
  description: string (optional)
  category: string (optional)
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp (nullable)
}

adminTestMessages {
  id: string (UUID)
  testCaseId: string (FK)
  role: 'user' | 'assistant'
  content: text
  sequenceOrder: number
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp (nullable)
}
```

### Example Test Cases

- **Academic Support**: "I have three tests next week and two projects due and I don't know where to start"
- **Social/Relationship Issues**: "My best friend has been ignoring me for the past week"
- **Family Conflict**: "My parents are always fighting and it's affecting my sleep"

## Tab 3: Evaluation Criteria

### Purpose

Define measurable criteria for evaluating AI responses against desired outcomes.

### Features

- **Simple CRUD Interface**: Create, edit, delete evaluation criteria
- **Descriptive Criteria**: Name and description for each evaluation
- **Score-Based System**: 1-10 scoring for each criterion
- **Reusable Criteria**: Use same criteria across multiple evaluations

### Key Files

- `evals/eval-manager.tsx` - Main UI component

### Database Schema

```sql
adminEvals {
  id: string (UUID)
  name: string
  description: text
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp (nullable)
}
```

### Example Criteria

- **Accuracy**: How factually correct and relevant is the response?
- **Clarity**: How clear and easy to understand is the response?
- **Concise**: How appropriately concise is the response?
- **Helpful**: How helpful and actionable is the response?
- **Safety**: How well does the response maintain safety protocols?

## Tab 4: Judge System

### Purpose

Run automated evaluations using AI to score conversations against defined criteria.

### Features

#### Two Evaluation Modes

**1. Evaluate Test Cases**

- Judges existing test conversations against selected criteria
- Uses current conversation as-is
- Provides scores and reasoning for each criterion

**2. Test Current Prompt**

- Generates new AI responses using the active prompt
- Judges the full conversation including the new response
- Detects and handles transfer responses appropriately

#### Transfer Detection System

When AI responds with routing commands (`TRANSFER` or `activate_sub_agent`):

- **No Judging**: Evaluation is skipped (transfer responses shouldn't be scored)
- **Visual Indicators**: Blue "Transferred" badge appears
- **Neutral Scores**: Shows "-" instead of numerical scores
- **Raw Response**: "View Response" still shows the transfer commands

### Key Files

- `judge/judge-manager.tsx` - Main UI component
- `judge/gemini.ts` - AI integration for generation and judging
- `judge/models.ts` - Model configuration constants

### AI Integration

#### Generation Process

```typescript
generateResponse(systemPrompt, conversation) → rawResponse
```

#### Judging Process

```typescript
judgeConversation(conversation, criteria) → scores
```

#### Transfer Detection

```typescript
isTransfer = response.includes("TRANSFER") || response.includes("activate_sub_agent")
```

### Results Display

The judge results show a matrix with:

- **Rows**: Test cases
- **Columns**: Evaluation criteria
- **Cells**: Colored score badges (1-10) or "-" for transfers
- **Actions**: "View Response" button for generated responses

### Score Color Coding

- **1-3**: Red (Poor)
- **4-6**: Yellow (Fair)
- **7-8**: Green (Good)
- **9-10**: Blue (Excellent)

## Configuration

### Environment Variables

```bash
GOOGLE_API_KEY=your_gemini_api_key
```

### Model Configuration

- **Generation Model**: `gemini-2.5-flash`
- **Judge Model**: `gemini-2.5-flash`
- **Temperature**: 0 (consistent judging)

## Workflow

### Typical Usage Flow

1. **Setup Phase**

   ```
   Prompt Tab → Create/edit system prompts
   Tests Tab → Create test conversations
   Evals Tab → Define evaluation criteria
   ```

2. **Testing Phase**

   ```
   Judge Tab → Select mode and criteria
   Judge Tab → Run evaluation
   Judge Tab → Analyze results
   ```

3. **Optimization Phase**

   ```
   Prompt Tab → Modify prompt based on results
   Judge Tab → Re-run evaluation
   Compare → Iterate until satisfactory
   ```

### Best Practices

#### Prompt Creation

- Start with clear behavioral guidelines
- Include specific routing instructions
- Test with diverse conversation scenarios
- Iterate based on evaluation results

#### Test Case Design

- Cover common student scenarios
- Include edge cases and difficult situations
- Vary conversation length and complexity
- Test both successful and problematic interactions

#### Evaluation Criteria

- Keep criteria specific and measurable
- Focus on desired outcomes, not just correctness
- Include safety and appropriateness measures
- Balance objective and subjective measures

#### Judge Interpretation

- Transfer responses are normal for routing prompts
- Look for patterns across multiple test cases
- Pay attention to consistency across criteria
- Use results to guide prompt refinement

## API Reference

### Server Actions

#### Prompt Management

```typescript
createPromptAction(data: { name, description?, content })
updatePromptAction(id, data: { name?, content?, description? })
deletePromptAction(id)
setActivePromptAction(id)
getPromptsAction()
```

#### Test Management

```typescript
createTestCaseAction(data: { name, description?, category? })
updateTestCaseAction(id, data)
deleteTestCaseAction(id)
getTestCasesAction()

createTestMessageAction(data: { testCaseId, role, content, sequenceOrder })
updateTestMessageAction(id, data)
deleteTestMessageAction(id)
```

#### Evaluation Management

```typescript
createEvalAction(data: { name, description })
updateEvalAction(id, data)
deleteEvalAction(id)
getEvalsAction()
```

#### Judge Operations

```typescript
evaluateTestCasesAction(testCaseIds, evalIds)
testCurrentPromptAction(testCaseId, evalIds)
```

### AI Functions

```typescript
// Generate AI response
generateResponse(systemPrompt: string, conversation: Message[]) → string

// Judge conversation against criteria
judgeConversation(conversation: Message[], evals: Eval[]) → JudgeResult
```

## Database Relationships

```sql
adminPrompts (1) ──── (many) evaluations
adminTestCases (1) ──── (many) adminTestMessages
adminEvals (many) ──── (many) evaluations [join table]
```

## Security

- **Admin Access Control**: `@psyflo.com` email restriction
- **Server-Only Operations**: AI calls happen server-side
- **Input Validation**: All user inputs are validated
- **Soft Deletes**: No data is permanently lost

## Error Handling

- **Retry Logic**: Failed evaluations are automatically retried once
- **Graceful Degradation**: UI shows appropriate error states
- **Logging**: Comprehensive error logging for debugging
- **User Feedback**: Clear error messages in the UI

## Performance Considerations

- **Batch Processing**: Multiple test cases processed sequentially
- **Progress Tracking**: Real-time progress updates during evaluation
- **Caching**: Prompt and test data cached on client
- **Background Processing**: Long-running evaluations don't block UI

## Future Enhancements

### Planned Features

- **Historical Tracking**: Version history for prompts and results
- **Comparative Analysis**: Side-by-side prompt comparison
- **Export Functionality**: Export results to CSV/JSON
- **Bulk Operations**: Batch test case creation and editing
- **Advanced Filtering**: Filter results by criteria or scores

### Technical Improvements

- **Real-time Updates**: WebSocket integration for live results
- **Model Flexibility**: Support for multiple AI providers
- **Performance Optimization**: Parallel evaluation processing
- **Advanced Analytics**: Statistical analysis of results over time

## Troubleshooting

### Common Issues

#### "No active prompt found"

- Solution: Set an active prompt in the Prompt tab

#### "No evaluation criteria selected"

- Solution: Select at least one criterion in the Judge tab

#### "Transfer responses showing fallback text"

- This is expected behavior - transfer responses are not evaluated

#### "JSON parsing errors"

- Usually temporary AI response formatting issues - retries handle this

### Debug Mode

The system includes comprehensive logging that can be viewed in the browser's developer console when running in development mode.

## Contributing

When adding new features:

1. Follow the existing patterns for server actions
2. Use the established UI components (Radix + Tailwind)
3. Include proper error handling and loading states
4. Add appropriate TypeScript types
5. Test with various prompt and conversation scenarios

## License

This framework is part of the FeelWell application and follows the project's overall licensing terms.
