import { useState, type FormEvent } from "react";
import { useFetch } from "../../hooks/useFetch";
import { fetchConcepts } from "../../services/adminService";
import type { ExerciseInput } from "../../types/admin.types";
import type { Difficulty } from "../../types/learning.types";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import Input from "../common/Input";
import Loader from "../common/Loader";
import Select from "../common/Select";
import Textarea from "../common/Textarea";
import DifficultySelect from "./DifficultySelect";

interface Props {
  initial: ExerciseInput | null;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: ExerciseInput) => void;
  onCancel: () => void;
}

export default function ExerciseForm({ initial, submitting, error, onSubmit, onCancel }: Props) {
  const concepts = useFetch(fetchConcepts, "admin-concepts");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [starterCode, setStarterCode] = useState(initial?.starterCode ?? "");
  const [expectedConcept, setExpectedConcept] = useState(initial?.expectedConcept ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "BEGINNER");

  const list = concepts.data ?? [];
  const selected = list.find((c) => c.key === expectedConcept);
  // An exercise from before Phase 15 has a key that is not in the list.
  const legacy = initial !== null && expectedConcept !== "" && !selected && !concepts.loading;
  const valid = title.trim() && description.trim() && instructions.trim() && selected;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      instructions,
      starterCode,
      expectedConcept,
      difficulty,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <ErrorMessage message={error} />}
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} required />
      <Input
        label="Short description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={500}
        required
      />
      <Textarea
        label="Instructions"
        rows={6}
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        maxLength={20000}
        required
      />
      <Textarea
        label="Starter code"
        hint="The EduLang program students begin with. A submission identical to it is never accepted."
        rows={6}
        className="font-mono"
        value={starterCode}
        onChange={(e) => setStarterCode(e.target.value)}
        maxLength={20000}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          {concepts.loading && <Loader label="Loading concepts..." />}
          {concepts.error && <ErrorMessage message={concepts.error} />}
          {!concepts.loading && !concepts.error && (
            <Select
              label="What must the student achieve? (answer key)"
              value={selected ? expectedConcept : ""}
              onChange={(e) => setExpectedConcept(e.target.value)}
            >
              <option value="">Choose...</option>
              {list.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </Select>
          )}
          {selected && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{selected.description}</p>
          )}
          {legacy && (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              This exercise uses an old key ("{expectedConcept}") that cannot be checked
              automatically. Choose a concept to fix it.
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Students never see this.
          </p>
        </div>
        <DifficultySelect value={difficulty} onChange={setDifficulty} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting || !valid}>
          {submitting ? "Saving..." : "Save exercise"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
