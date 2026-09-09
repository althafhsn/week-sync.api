import { Injectable, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
const DEFAULT_EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings';
const DEFAULT_TIMEOUT_SECONDS = 30;
const EMBEDDING_DIMENSIONS = 1536;

interface IndexableReport {
  id: string;
  [key: string]: unknown;
}

export interface ReportSearchHit {
  score: number;
  id: string;
  startDate: unknown;
  endDate: unknown;
  userId: unknown;
  projectId: unknown;
  reportStatusId: unknown;
}

// Fire-and-forget indexing of report responses into Qdrant: embeds the report
// blob and upserts it as a point keyed by the report's own id, so re-fetching
// a report simply overwrites its previous vector/blob rather than duplicating it.
@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);
  private readonly client: QdrantClient;
  private readonly collection = process.env.QDRANT_COLLECTION ?? 'Reports';
  private ensureCollectionPromise: Promise<void> | undefined;

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
  }

  async indexReport(report: IndexableReport): Promise<void> {
    await this.indexReports([report]);
  }

  async indexReports(reports: IndexableReport[]): Promise<void> {
    if (reports.length === 0) return;

    await this.ensureCollection();
    const vectors = await this.embed(reports.map((report) => JSON.stringify(report)));
    console.log(`Indexing ${reports.length} report(s) into Qdrant collection "${this.collection}"`);
    console.log(`Embedding vectors: ${vectors.length} vectors of dimension ${vectors[0].length}`);

    await this.client.upsert(this.collection, {
      points: reports.map((report, index) => ({
        id: report.id,
        vector: vectors[index],
        payload: { reportId: report.id, blob: report, indexedAt: new Date().toISOString() },
      })),
    });
  }

  async search(queryText: string, limit: number): Promise<ReportSearchHit[]> {
    await this.ensureCollection();
    const [vector] = await this.embed([queryText]);
    const { points } = await this.client.query(this.collection, { query: vector, limit, with_payload: true });

    return points.map((point) => {
      const blob = (point.payload?.blob ?? {}) as Record<string, unknown>;
      return {
        score: point.score,
        id: String(blob.id ?? point.id),
        startDate: blob.startDate,
        endDate: blob.endDate,
        userId: blob.userId,
        projectId: blob.projectId,
        reportStatusId: blob.reportStatusId,
      };
    });
  }

  async deleteReport(id: string): Promise<void> {
    await this.ensureCollection();
    await this.client.delete(this.collection, { points: [id] });
  }

  // Fire-and-forget entry point for report deletion, mirroring indexReportsAsync.
  deleteReportAsync(id: string): void {
    void this.deleteReport(id).catch((error) =>
      this.logger.error(`Failed to delete report "${id}" from Qdrant`, error instanceof Error ? error.stack : error),
    );
  }

  private ensureCollection(): Promise<void> {
    if (!this.ensureCollectionPromise) {
      this.ensureCollectionPromise = this.client
        .collectionExists(this.collection)
        .then(async ({ exists }) => {
          if (!exists) {
            await this.client.createCollection(this.collection, {
              vectors: { size: EMBEDDING_DIMENSIONS, distance: 'Cosine' },
            });
          }
        })
        .catch((error) => {
          // Allow the next call to retry rather than caching a failed setup.
          this.ensureCollectionPromise = undefined;
          throw error;
        });
    }
    return this.ensureCollectionPromise;
  }

  private async embed(inputs: string[]): Promise<number[][]> {
    const url = process.env.OPENAI_EMBEDDINGS_URL ?? DEFAULT_EMBEDDINGS_URL;
    const model = process.env.OPENAI_EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL;
    const timeoutSeconds = Number(process.env.OPENAI_TIMEOUT_SECONDS) || DEFAULT_TIMEOUT_SECONDS;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model, input: inputs }),
      signal: AbortSignal.timeout(timeoutSeconds * 1000),
    });

    if (!response.ok) {
      throw new Error(`OpenAI embeddings request failed with status ${response.status}: ${await response.text()}`);
    }

    const body = (await response.json()) as { data: { embedding: number[]; index: number }[] };
    return body.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
  }

  // Fire-and-forget entry point: swallow and log errors so indexing never
  // affects the HTTP response of the report endpoint that triggered it.
  indexReportsAsync(reports: IndexableReport[]): void {
    void this.indexReports(reports).catch((error) =>
      this.logger.error(`Failed to index ${reports.length} report(s) into Qdrant`, error instanceof Error ? error.stack : error),
    );
  }
}
