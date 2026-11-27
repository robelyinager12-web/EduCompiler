import { Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import ErrorMessage from "../../components/common/ErrorMessage";
import PageState from "../../components/common/PageState";
import { useFetch } from "../../hooks/useFetch";
import { deleteStudent, fetchStudents } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { formatDate } from "../../utils/formatDate";

const PAGE_SIZE = 10;

export default function StudentManagementPage() {
  const [page, setPage] = useState(1);
  const students = useFetch(() => fetchStudents(page, PAGE_SIZE), `students-${page}`);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const items = students.data?.items ?? [];
  const total = students.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function handleDelete(id: string, name: string) {
    const ok = window.confirm(
      `Delete the account of ${name}? Their programs, history and submissions are deleted too. This cannot be undone.`,
    );
    if (!ok) return;

    setActionError(null);
    setDeletingId(id);
    try {
      await deleteStudent(id);
      // Deleting the last row of a page would leave an empty page.
      if (items.length === 1 && page > 1) setPage(page - 1);
      else students.reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Student management</h1>
      {actionError && <ErrorMessage message={actionError} />}

      <PageState loading={students.loading} error={students.error} onRetry={students.reload}>
        {items.length === 0 ? (
          <Card>
            <p className="text-slate-600 dark:text-slate-300">No students have registered yet.</p>
          </Card>
        ) : (
          <>
            <Card className="overflow-x-auto !p-0">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Programs</th>
                    <th className="px-4 py-3">Runs</th>
                    <th className="px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {items.map((student) => (
                    <tr key={student.id}>
                      <td className="px-4 py-2 font-medium">{student.name}</td>
                      <td className="px-4 py-2">{student.email}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{formatDate(student.createdAt)}</td>
                      <td className="px-4 py-2">{student._count.programs}</td>
                      <td className="px-4 py-2">{student._count.runs}</td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="secondary"
                          aria-label={`Delete ${student.name}`}
                          disabled={deletingId === student.id}
                          onClick={() => handleDelete(student.id, student.name)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <div className="flex items-center justify-between">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Page {page} of {pages} ({total} students)
              </span>
              <Button
                variant="secondary"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </PageState>
    </div>
  );
}
