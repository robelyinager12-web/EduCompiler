import { deleteStudent, listStudents } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { parsePaging } from "../utils/paging";

export const getStudents = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await listStudents(parsePaging(req.query)) });
});

export const deleteStudentHandler = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await deleteStudent(String(req.params.id)) });
});
