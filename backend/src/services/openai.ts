import OpenAI from 'openai';
import dotenv from 'dotenv';
import { SYSTEM_PROMPT, buildUserPrompt } from '../utils/prompts.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedShift {
  employeeId: string | null;
  employeeName: string;
  start: string;
  end: string;
  role: string | null;
  notes: string | null;
  source_text: string | null;
}

export interface ParseShiftsResult {
  shifts: ParsedShift[];
  warnings: string[];
  errors: string[];
}

export async function parseShiftsWithAI(params: {
  text: string;
  month: string;
  timezone: string;
  employees: Array<{ id: string; name: string; role?: string | null }>;
}): Promise<ParseShiftsResult> {
  try {
    const userPrompt = buildUserPrompt(params);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);

    // Validate structure
    if (!parsed.shifts || !Array.isArray(parsed.shifts)) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return {
      shifts: parsed.shifts || [],
      warnings: parsed.warnings || [],
      errors: parsed.errors || [],
    };
  } catch (error) {
    console.error('OpenAI parsing error:', error);
    throw error;
  }
}

