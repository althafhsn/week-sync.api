import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';
import { syncReportChildren } from './report-content-sync.util.js';
import { pickTaskData, pickNextWeekTaskData, pickHighlightData, pickHoursData } from './report-content-item.util.js';
import { isRestrictViolation } from '../common/prisma-error.util.js';
import { parseInclude } from '../common/parse-include.util.js';
import { RawPaginationQuery, resolvePagination, toPaginatedResult } from '../common/pagination.util.js';
import { AuthenticatedUser, assertReportAccess, isManagerRole } from '../common/report-access.util.js';
import { VectorStoreService, ReportSearchHit } from '../vector-store/vector-store.service.js';
import { ReportSearchFilterService, ExtractedReportFilters } from './report-search-filter.service.js';

const RECORD_NOT_FOUND = 'P2025';
const FOREIGN_KEY_VIOLATION = 'P2003';
const NEEDS_CORRECTION_STATUS = 'Needs Correction';
const DRAFT_STATUS = 'Draft';
const SUBMITTED_STATUS = 'Submitted';
const APPROVED_STATUS = 'Approved';

// Legal reportStatus transitions, keyed by current status name. An employee
// addressing corrections may save their in-progress fix as a Draft again
// (not just resubmit outright) before eventually moving back to Submitted.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  [DRAFT_STATUS]: [SUBMITTED_STATUS],
  [SUBMITTED_STATUS]: [NEEDS_CORRECTION_STATUS, APPROVED_STATUS],
  [NEEDS_CORRECTION_STATUS]: [DRAFT_STATUS, SUBMITTED_STATUS],
  [APPROVED_STATUS]: [],
};

// Fields only the report's owner may change (report content).
const OWNER_ONLY_FIELDS = [
  'tasks',
  'reportHighlights',
  'reportHours',
  'reportNextWeekTasks',
  'notes',
  'links',
  'startDate',
  'endDate',
  'userId',
  'projectId',
] as const;

// Always used when (re)indexing a report into the vector store, regardless of what
// the caller asked the API to include — search needs the human-readable names
// (owner, project, status) embedded alongside the raw ids to be useful at all.
const VECTOR_INDEX_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
  project: true,
  reportStatus: true,
} satisfies Prisma.ReportInclude;

const REPORT_INCLUDE_MAP = {
  user: { field: 'user', value: { select: { id: true, name: true, email: true, jobTitle: true } } },
  project: { field: 'project', value: true },
  reportStatus: { field: 'reportStatus', value: true },
  tasks: { field: 'tasks', value: { include: { priorityType: true, taskStatus: true } } },
  reportNextWeekTasks: { field: 'reportNextWeekTasks', value: true },
  reportHighlights: { field: 'reportHighlights', value: { include: { reportHighlightType: true } } },
  reportHours: { field: 'reportHours', value: { include: { reportHourType: true } } },
};

// Applies the structured filters extracted from an AI-search query to one vector
// hit. Unlike findAll()'s strict containment (gte startDate / lte endDate) — meant
// for an exact week-range picker — a report's week can straddle a month/range
// boundary (e.g. Aug 31 - Sep 4), so a query like "only august" must match on
// overlap with the requested range rather than requiring the whole week to fit
// inside it.
function matchesExtractedFilters(hit: ReportSearchHit, filters: ExtractedReportFilters): boolean {
  if (filters.userId && hit.userId !== filters.userId) return false;
  if (filters.projectId && hit.projectId !== filters.projectId) return false;
  if (filters.reportStatusId != null && hit.reportStatusId !== filters.reportStatusId) return false;

  const hitStart = hit.startDate ? new Date(hit.startDate as string) : undefined;
  const hitEnd = hit.endDate ? new Date(hit.endDate as string) : undefined;

  if (filters.endDate) {
    if (!hitStart || hitStart > new Date(filters.endDate)) return false;
  }
  if (filters.startDate) {
    if (!hitEnd || hitEnd < new Date(filters.startDate)) return false;
  }
  return true;
}

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vectorStore: VectorStoreService,
    private readonly searchFilters: ReportSearchFilterService,
  ) {}

  private buildInclude(include?: string) {
    return parseInclude<Prisma.ReportInclude>(include, REPORT_INCLUDE_MAP);
  }

  // Re-fetches the given reports with the full relation set and pushes them into the
  // vector store, fire-and-forget. Called after any create/update so a report's indexed
  // copy is refreshed whenever its content changes, and never blocks the HTTP response.
  private reindexReports(ids: string[]): void {
    if (ids.length === 0) return;
    void this.prisma.report
      .findMany({ where: { id: { in: ids } }, include: VECTOR_INDEX_INCLUDE })
      .then((reports) => this.vectorStore.indexReportsAsync(reports))
      .catch((error) => this.logger.error(`Failed to reindex report(s) ${ids.join(', ')}`, error instanceof Error ? error.stack : error));
  }

  // Snapshots the report as it stands before an edit is applied, but only while it is
  // "Needs Correction" — this captures exactly the version a manager's comment was made
  // against, right before the user's resubmission overwrites it.
  private async archiveIfNeedsCorrection(tx: Prisma.TransactionClient, id: string) {
    const current = await tx.report.findUnique({
      where: { id },
      include: {
        reportStatus: true,
        tasks: { include: { priorityType: true, taskStatus: true } },
        reportNextWeekTasks: true,
        reportHighlights: { include: { reportHighlightType: true } },
        reportHours: { include: { reportHourType: true } },
      },
    });
    if (!current || current.reportStatus.name !== NEEDS_CORRECTION_STATUS) {
      return;
    }

    const lastVersion = await tx.reportHistory.aggregate({
      where: { reportId: id },
      _max: { versionNumber: true },
    });
    const { tasks, reportNextWeekTasks, reportHighlights, reportHours, reportStatusId, comment, notes, startDate, endDate, links, updatedAt } = current;

    await tx.reportHistory.create({
      data: {
        reportId: id,
        versionNumber: (lastVersion._max.versionNumber ?? 0) + 1,
        reportStatusId,
        comment,
        notes,
        startDate,
        endDate,
        links,
        submittedAt: updatedAt,
        snapshot: JSON.parse(JSON.stringify({ tasks, reportNextWeekTasks, reportHighlights, reportHours })),
      },
    });
  }

  private async loadReportForAccessCheck(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { reportStatus: true },
    });
    if (!report) {
      throw new NotFoundException(`Report with id "${id}" not found`);
    }
    return report;
  }

  async getHistory(reportId: string, caller: AuthenticatedUser, pageQuery?: RawPaginationQuery) {
    const report = await this.loadReportForAccessCheck(reportId);
    assertReportAccess(report.userId, caller, await isManagerRole(this.prisma, caller.roleId));

    const pagination = resolvePagination(pageQuery);
    const where: Prisma.ReportHistoryWhereInput = { reportId };

    // Deliberately excludes the heavy `snapshot` JSON blob — the list view only
    // needs enough to identify a version; full content is fetched on demand via
    // getHistoryVersion().
    const [data, count] = await Promise.all([
      this.prisma.reportHistory.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { versionNumber: 'desc' },
        select: {
          id: true,
          reportId: true,
          versionNumber: true,
          reportStatusId: true,
          reportStatus: true,
          comment: true,
          notes: true,
          startDate: true,
          endDate: true,
          links: true,
          submittedAt: true,
          archivedAt: true,
        },
      }),
      this.prisma.reportHistory.count({ where }),
    ]);

    return toPaginatedResult(data, count, pagination);
  }

  async getHistoryVersion(reportId: string, historyId: string, caller: AuthenticatedUser) {
    const report = await this.loadReportForAccessCheck(reportId);
    assertReportAccess(report.userId, caller, await isManagerRole(this.prisma, caller.roleId));

    const version = await this.prisma.reportHistory.findFirst({
      where: { id: historyId, reportId },
      include: { reportStatus: true },
    });
    if (!version) {
      throw new NotFoundException(`Report history version "${historyId}" not found for report "${reportId}"`);
    }
    return version;
  }

  async create(dto: CreateReportDto, caller: AuthenticatedUser, include?: string) {
    const {
      projectId,
      tasks,
      reportHighlights,
      reportHours,
      reportNextWeekTasks,
      startDate,
      endDate,
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      user: _user,
      project: _project,
      reportStatus: _reportStatus,
      userId: _userId,
      ...rest
    } = dto;

    try {
      const created = await this.prisma.report.create({
        data: {
          // A report can only ever be created for the authenticated caller —
          // never trust a client-supplied userId here.
          userId: caller.sub,
          projectId,
          ...rest,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          ...(tasks?.length && { tasks: { create: tasks.map(pickTaskData) } }),
          ...(reportNextWeekTasks?.length && {
            reportNextWeekTasks: { create: reportNextWeekTasks.map(pickNextWeekTaskData) },
          }),
          ...(reportHighlights?.length && { reportHighlights: { create: reportHighlights.map(pickHighlightData) } }),
          ...(reportHours?.length && { reportHours: { create: reportHours.map(pickHoursData) } }),
        },
        include: this.buildInclude(include),
      });
      this.reindexReports([created.id]);
      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === FOREIGN_KEY_VIOLATION) {
        throw new NotFoundException('User, project, or one of the referenced lookup values was not found');
      }
      throw error;
    }
  }

  async findAll(
    include: string | undefined,
    filters: { userId?: string; projectId?: string; reportStatusId?: number; startDate?: string; endDate?: string } | undefined,
    caller: AuthenticatedUser,
    pageQuery?: RawPaginationQuery,
  ) {
    const callerIsManager = await isManagerRole(this.prisma, caller.roleId);
    // Employees can only ever list their own reports — any userId filter they
    // pass is overridden. Managers may filter by any userId, or omit it to see everyone.
    const userId = callerIsManager ? filters?.userId : caller.sub;

    // A draft is the owner's unpublished working copy. A manager browsing
    // anyone else's reports (including the unfiltered "everyone" list) must
    // never see it — only the report's own owner can list their drafts.
    const viewingOthers = callerIsManager && userId !== caller.sub;

    const pagination = resolvePagination(pageQuery);
    const where: Prisma.ReportWhereInput = {
      userId,
      projectId: filters?.projectId,
      reportStatusId: filters?.reportStatusId,
      ...(filters?.startDate && { startDate: { gte: new Date(filters.startDate) } }),
      ...(filters?.endDate && { endDate: { lte: new Date(filters.endDate) } }),
      ...(viewingOthers && { reportStatus: { name: { not: DRAFT_STATUS } } }),
    };

    const [data, count] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: this.buildInclude(include),
      }),
      this.prisma.report.count({ where }),
    ]);

  

    this.reindexReports(data.map((report) => report.id));

    return toPaginatedResult(data, count, pagination);
  }

  async findOne(id: string, caller: AuthenticatedUser, include?: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: this.buildInclude(include),
    });
    if (!report) {
      throw new NotFoundException(`Report with id "${id}" not found`);
    }
    assertReportAccess(report.userId, caller, await isManagerRole(this.prisma, caller.roleId));
    return report;
  }

  private assertUpdatePermissions(
    current: { userId: string; reportStatus: { name: string } },
    dto: UpdateReportDto,
    caller: AuthenticatedUser,
    callerIsManager: boolean,
    targetStatusName: string | undefined,
  ) {
    const currentStatusName = current.reportStatus.name;
    const isOwnerActing = current.userId === caller.sub;

    if (targetStatusName && targetStatusName !== currentStatusName) {
      const allowed = ALLOWED_TRANSITIONS[currentStatusName] ?? [];
      if (!allowed.includes(targetStatusName)) {
        throw new ConflictException(`Cannot move a report from "${currentStatusName}" to "${targetStatusName}"`);
      }
    }

    if (!isOwnerActing) {
      // A Manager reviewing someone else's report may only record a decision
      // (status + comment) on a Submitted report — never edit its content.
      if (!callerIsManager) {
        throw new ForbiddenException('You do not have access to this report');
      }
      for (const field of OWNER_ONLY_FIELDS) {
        if (dto[field] !== undefined) {
          throw new ForbiddenException('Managers may only set a decision status and a review comment');
        }
      }
      if (currentStatusName !== SUBMITTED_STATUS) {
        throw new ConflictException('Only a submitted report can be reviewed');
      }
      if (!targetStatusName || (targetStatusName !== APPROVED_STATUS && targetStatusName !== NEEDS_CORRECTION_STATUS)) {
        throw new ConflictException('A review must approve or request corrections');
      }
      return;
    }

    // The owner (employee, or a manager editing their own report) is editing.
    if (dto.comment !== undefined) {
      throw new ForbiddenException('Only a reviewing manager can set a review comment');
    }
    if (
      targetStatusName &&
      targetStatusName !== currentStatusName &&
      targetStatusName !== SUBMITTED_STATUS &&
      targetStatusName !== DRAFT_STATUS
    ) {
      throw new ForbiddenException('You can only save or submit your own report, not approve or reject it');
    }
    const editableStatuses: string[] = [DRAFT_STATUS, NEEDS_CORRECTION_STATUS];
    if (!editableStatuses.includes(currentStatusName)) {
      throw new ConflictException(`Cannot edit a report that is already "${currentStatusName}"`);
    }
  }

  async update(id: string, dto: UpdateReportDto, caller: AuthenticatedUser, include?: string) {
    const current = await this.loadReportForAccessCheck(id);
    const callerIsManager = await isManagerRole(this.prisma, caller.roleId);

    let targetStatusName: string | undefined;
    if (dto.reportStatusId !== undefined) {
      const targetStatus = await this.prisma.reportStatus.findUnique({ where: { id: dto.reportStatusId } });
      if (!targetStatus) {
        throw new NotFoundException('Report status not found');
      }
      targetStatusName = targetStatus.name;
    }

    this.assertUpdatePermissions(current, dto, caller, callerIsManager, targetStatusName);

    const {
      tasks,
      reportHighlights,
      reportHours,
      reportNextWeekTasks,
      startDate,
      endDate,
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      user: _user,
      project: _project,
      reportStatus: _reportStatus,
      ...rest
    } = dto;

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        await this.archiveIfNeedsCorrection(tx, id);

        if (tasks) {
          await syncReportChildren(
            tasks,
            pickTaskData,
            {
              deleteMany: (notInIds) => tx.task.deleteMany({ where: { reportId: id, id: { notIn: notInIds } } }),
              updateMany: (taskId, data) => tx.task.updateMany({ where: { id: taskId, reportId: id }, data }),
              create: (data) => tx.task.create({ data: { ...data, reportId: id } }),
            },
            'Task',
          );
        }
        if (reportHighlights) {
          await syncReportChildren(
            reportHighlights,
            pickHighlightData,
            {
              deleteMany: (notInIds) =>
                tx.reportHighlight.deleteMany({ where: { reportId: id, id: { notIn: notInIds } } }),
              updateMany: (highlightId, data) =>
                tx.reportHighlight.updateMany({ where: { id: highlightId, reportId: id }, data }),
              create: (data) => tx.reportHighlight.create({ data: { ...data, reportId: id } }),
            },
            'Report highlight',
          );
        }
        if (reportHours) {
          await syncReportChildren(
            reportHours,
            pickHoursData,
            {
              deleteMany: (notInIds) => tx.reportHours.deleteMany({ where: { reportId: id, id: { notIn: notInIds } } }),
              updateMany: (hoursId, data) => tx.reportHours.updateMany({ where: { id: hoursId, reportId: id }, data }),
              create: (data) => tx.reportHours.create({ data: { ...data, reportId: id } }),
            },
            'Report hours entry',
          );
        }
        if (reportNextWeekTasks) {
          await syncReportChildren(
            reportNextWeekTasks,
            pickNextWeekTaskData,
            {
              deleteMany: (notInIds) =>
                tx.reportNextWeekTask.deleteMany({ where: { reportId: id, id: { notIn: notInIds } } }),
              updateMany: (taskId, data) =>
                tx.reportNextWeekTask.updateMany({ where: { id: taskId, reportId: id }, data }),
              create: (data) => tx.reportNextWeekTask.create({ data: { ...data, reportId: id } }),
            },
            'Next week task',
          );
        }

        return tx.report.update({
          where: { id },
          data: {
            ...rest,
            ...(startDate && { startDate: new Date(startDate) }),
            ...(endDate && { endDate: new Date(endDate) }),
            // Starting a fresh draft leaves any prior review comment behind —
            // it no longer applies to the content being drafted.
            ...(targetStatusName === DRAFT_STATUS && { comment: null }),
          },
          include: this.buildInclude(include),
        });
      }, { timeout: 30000, maxWait: 10000 });
      this.reindexReports([updated.id]);
      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === RECORD_NOT_FOUND) {
          throw new NotFoundException(`Report with id "${id}" not found`);
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
          throw new NotFoundException('User, project, or one of the referenced lookup values was not found');
        }
      }
      throw error;
    }
  }

  async remove(id: string, caller: AuthenticatedUser) {
    const report = await this.loadReportForAccessCheck(id);
    assertReportAccess(report.userId, caller, await isManagerRole(this.prisma, caller.roleId));

    try {
      const removed = await this.prisma.report.delete({ where: { id } });
      this.vectorStore.deleteReportAsync(id);
      return removed;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
        throw new NotFoundException(`Report with id "${id}" not found`);
      }
      if (isRestrictViolation(error)) {
        throw new ConflictException('Cannot delete this report because it still has related content');
      }
      throw error;
    }
  }

  // Ranks reports by semantic similarity to `queryText`, then hydrates the matched
  // page from Postgres so the response is a normal paginated report list (same
  // shape as findAll) rather than a bare vector hit — a drop-in for the frontend's
  // existing report list call, just ranked by relevance instead of createdAt.
  async search(queryText: string, caller: AuthenticatedUser, include: string | undefined, pageQuery?: RawPaginationQuery) {
    if (!queryText?.trim()) {
      throw new BadRequestException('Query text is required');
    }

    const callerIsManager = await isManagerRole(this.prisma, caller.roleId);
    const pagination = resolvePagination(pageQuery);

    // Understand who/what/when the query names ("reports from nasra", "last
    // week", "still submitted") so it narrows results the same way the
    // status/project/date filters on the list view do, on top of ranking by
    // semantic relevance.
    const filters = await this.searchFilters.extract(queryText, caller);

    // Over-fetch from the vector store since results still need access filtering
    // (and, for employees, narrowing to their own reports) before paging.
    const hits = await this.vectorStore.search(queryText, (pagination.skip + pagination.take) * 5);
    const accessible = callerIsManager ? hits : hits.filter((hit) => hit.userId === caller.sub);

    // Same rule as findAll(): a Draft is the owner's unpublished working copy,
    // so a manager searching across everyone must never see someone else's
    // draft turn up in results, even by semantic match.
    const draftStatus = callerIsManager
      ? await this.prisma.reportStatus.findUnique({ where: { name: DRAFT_STATUS } })
      : null;
    const excludingOthersDrafts = draftStatus
      ? accessible.filter((hit) => hit.userId === caller.sub || hit.reportStatusId !== draftStatus.id)
      : accessible;

    const visible = excludingOthersDrafts.filter((hit) => matchesExtractedFilters(hit, filters));
    const page = visible.slice(pagination.skip, pagination.skip + pagination.take);

    const reports = await this.prisma.report.findMany({
      where: { id: { in: page.map((hit) => hit.id) } },
      include: this.buildInclude(include),
    });
    const byId = new Map(reports.map((report) => [report.id, report]));
    // Preserve the vector-similarity ranking — findMany's `in` filter doesn't guarantee order.
    const data = page.map((hit) => byId.get(hit.id)).filter((report) => report !== undefined);

    return toPaginatedResult(data, visible.length, pagination);
  }
}
