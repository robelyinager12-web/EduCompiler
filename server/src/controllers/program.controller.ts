import {
  createProgram,
  deleteProgram,
  getProgram,
  listPrograms,
  updateProgram,
} from "../services/program.service";
import { asyncHandler } from "../utils/asyncHandler";
import { currentUser } from "../utils/currentUser";
import type { ProgramInput } from "../validators/program.validator";

export const getPrograms = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await listPrograms(currentUser(req).id) });
});

export const getProgramById = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getProgram(currentUser(req).id, String(req.params.id)) });
});

export const createProgramHandler = asyncHandler(async (req, res) => {
  const program = await createProgram(currentUser(req).id, req.body as ProgramInput);
  res.status(201).json({ success: true, data: program });
});

export const updateProgramHandler = asyncHandler(async (req, res) => {
  const program = await updateProgram(
    currentUser(req).id,
    String(req.params.id),
    req.body as ProgramInput,
  );
  res.json({ success: true, data: program });
});

export const deleteProgramHandler = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: await deleteProgram(currentUser(req).id, String(req.params.id)),
  });
});
