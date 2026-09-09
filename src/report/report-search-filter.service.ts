import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthenticatedUser, isManagerRole } from '../common/report-access.util.js';

const DEFAULT_CHAT_MODEL = 'gpt-4o-mini';
const DEFAULT_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_TIMEOUT_SECONDS = 20;

export interface ExtractedReportFilters {
  userId?: string;
  projectId?: string;
  reportStatusId?: number;
  startDate?: string;
  endDate?: string;
}

interface NamedEntity {
  id: string;
  name: string;
}

// Turns a free-text AI-search query ("reports from nasra last week that are
// still submitted") into the same structured filter shape findAll() accepts,
// by asking a chat model to match the query against the caller's actual
// people/projects/statuses. Results are validated against those lists before
// use, so a hallucinated id can never leak into a Prisma/Qdrant filter.
@Injectable()
export class ReportSearchFilterService {
  private readonly logger = new Logger(ReportSearchFilterService.name);

  constructor(private readonly prisma: PrismaService) {}

  async extract(queryText: string, caller: AuthenticatedUser): Promise<ExtractedReportFilters> {
    if (!process.env.OPENAI_API_KEY) {
      return {};
    }

    const callerIsManager = await isManagerRole(this.prisma, caller.roleId);

    const [users, projects, statuses] = await Promise.all([
      callerIsManager
        ? this.prisma.user.findMany({ select: { id: true, name: true } })
        : Promise.resolve<NamedEntity[]>([]),
      this.prisma.project.findMany({ select: { id: true, name: true } }),
      this.prisma.reportStatus.findMany({ select: { id: true, name: true } }),
    ]);

    try {
      return await this.extractWithLlm(queryText, users, projects, statuses, callerIsManager);
    } catch (error) {
      this.logger.error(
        'Failed to extract structured filters from search query',
        error instanceof Error ? error.stack : error,
      );
      return {};
    }
  }

  private async extractWithLlm(
    queryText: string,
    users: NamedEntity[],
    projects: NamedEntity[],
    statuses: { id: number; name: string }[],
    callerIsManager: boolean,
  ): Promise<ExtractedReportFilters> {
    const url = process.env.OPENAI_CHAT_URL ?? DEFAULT_CHAT_URL;
    const model = process.env.OPENAI_CHAT_MODEL ?? DEFAULT_CHAT_MODEL;
    const timeoutSeconds = Number(process.env.OPENAI_TIMEOUT_SECONDS) || DEFAULT_TIMEOUT_SECONDS;
    const today = new Date().toISOString().slice(0, 10);

    const system = [
      'You extract structured filters from a free-text search query about weekly work reports.',
      `Today's date is ${today}.`,
      callerIsManager
        ? `Known people, "id: name": ${users.map((u) => `${u.id}: ${u.name}`).join('; ')}`
        : 'The caller may only search their own reports. Always leave userId null.',
      `Known projects, "id: name": ${projects.map((p) => `${p.id}: ${p.name}`).join('; ')}`,
      `Known statuses, "id: name": ${statuses.map((s) => `${s.id}: ${s.name}`).join('; ')}`,
      'Only set a field when the query clearly references it - do not guess. Match names case-insensitively, allowing partial matches (e.g. a first name) to the single closest known person or project.',
      'Resolve any date reference into a startDate/endDate range using today\'s date: a relative phrase ("last week", "this month") resolves against today; a bare month name with no year ("august", "in august") means the most recent occurrence of that month at or before today, spanning its full first-to-last day (e.g. "august" resolves to startDate 2026-08-01 and endDate 2026-08-31 if today is in or after August 2026); an explicit year ("august 2025") uses that year instead. Always set both startDate and endDate together as a full range, never just one.',
      'Respond with strict JSON only, exactly this shape and no extra keys: { "userId": string|null, "projectId": string|null, "reportStatusId": number|null, "startDate": "YYYY-MM-DD"|null, "endDate": "YYYY-MM-DD"|null }.',
    ].join('\n');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: queryText },
        ],
      }),
      signal: AbortSignal.timeout(timeoutSeconds * 1000),
    });

    if (!response.ok) {
      throw new Error(`OpenAI chat completion failed with status ${response.status}: ${await response.text()}`);
    }

    const body = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = body.choices?.[0]?.message?.content;
    if (!content) return {};

    const parsed = JSON.parse(content) as {
      userId?: string | null;
      projectId?: string | null;
      reportStatusId?: number | null;
      startDate?: string | null;
      endDate?: string | null;
    };

    const validUserIds = new Set(users.map((u) => u.id));
    const validProjectIds = new Set(projects.map((p) => p.id));
    const validStatusIds = new Set(statuses.map((s) => s.id));

    const userId = callerIsManager && parsed.userId && validUserIds.has(parsed.userId) ? parsed.userId : undefined;
    const projectId = parsed.projectId && validProjectIds.has(parsed.projectId) ? parsed.projectId : undefined;
    const reportStatusId =
      parsed.reportStatusId != null && validStatusIds.has(parsed.reportStatusId) ? parsed.reportStatusId : undefined;
    const startDate = parsed.startDate && !Number.isNaN(Date.parse(parsed.startDate)) ? parsed.startDate : undefined;
    const endDate = parsed.endDate && !Number.isNaN(Date.parse(parsed.endDate)) ? parsed.endDate : undefined;

    return { userId, projectId, reportStatusId, startDate, endDate };
  }
}
