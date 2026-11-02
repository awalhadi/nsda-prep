// The mock-exam question pool, served as a static file and fetched only when an exam starts.
import pool from "@/data/cbta/generated/pool.json";

export const dynamic = "force-static";

export function GET() {
  return Response.json(pool);
}
