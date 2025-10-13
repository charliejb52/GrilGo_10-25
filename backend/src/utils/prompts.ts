export const SYSTEM_PROMPT = `You are an assistant that converts plain-English shift scheduling requests into strict JSON.

Output ONLY valid JSON matching this schema:
{
  "shifts": [...],
  "warnings": [...],
  "errors": []
}

Each shift must have:
- employeeId: string (UUID from provided employee list) or null if unassigned
- employeeName: string (name of the employee)
- start: string (ISO-8601 with timezone, e.g., "2025-10-14T08:00:00-04:00")
- end: string (ISO-8601 with timezone)
- role: string or null
- notes: string or null
- source_text: string (snippet from user's text that generated this shift)

Rules:
1. Resolve relative dates (e.g., "next Monday", "tomorrow") using the provided month context
2. Match employeeId from the provided employee list by name (case-insensitive)
3. If employee name is ambiguous or not found, add to errors array
4. If dates are ambiguous, add to warnings array
5. All timestamps must use the provided timezone offset
6. Do NOT output any explanation, markdown, or additional keys
7. If you cannot parse something, add it to errors array
8. Output ONLY the JSON object`;

export function buildUserPrompt(params: {
  text: string;
  month: string;
  timezone: string;
  employees: Array<{ id: string; name: string; role?: string | null }>;
}): string {
  return `Current month context: ${params.month}
Timezone: ${params.timezone}

Available employees:
${params.employees.map((e) => `- ${e.name} (ID: ${e.id})${e.role ? ` - Role: ${e.role}` : ''}`).join('\n')}

User request:
${params.text}

Parse the above request and output ONLY the JSON response.`;
}

