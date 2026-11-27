import { getStats } from "../services/stats.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getStatsHandler = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await getStats() });
});
