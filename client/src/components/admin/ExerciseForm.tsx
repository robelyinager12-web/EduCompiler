import { useState, type FormEvent } from "react";
import type { ExerciseInput } from "../../types/admin.types";
import type { Difficulty } from "../../types/learning.types";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import Input from "../common/Input";
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
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [starterCode, setStarterCode] = useState(initial?.starterCode ?? "");
  const [expectedConcept, setExpectedConcept] = useState(initial?.expectedConcept ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "BEGINNER");

  const valid = title.trim() && description.trim() && instructions.trim() && expectedConcept.trim();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      instructions,
      starterCode,
      expectedConcept: expectedConcept.trim(),
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
        hint="The EduLang program students begin with. It may be empty."
        rows={6}
        className="font-mono"
        value={starterCode}
        onChange={(e) => setStarterCode(e.target.value)}
        maxLength={20000}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Input
            label="Expected concept (answer key)"
            value={expectedConcept}
            onChange={(e) => setExpectedConcept(e.target.value)}
            maxLength={200}
            required
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Used to check submissions. Students never see this.
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
