import { useState, type FormEvent } from "react";
import type { LessonInput } from "../../types/admin.types";
import type { Difficulty } from "../../types/learning.types";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import Input from "../common/Input";
import Textarea from "../common/Textarea";
import DifficultySelect from "./DifficultySelect";

interface Props {
  initial: LessonInput | null;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: LessonInput) => void;
  onCancel: () => void;
}

export default function LessonForm({ initial, submitting, error, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "BEGINNER");

  const valid = title.trim() && description.trim() && category.trim() && content.trim();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      content,
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          maxLength={60}
          required
        />
        <DifficultySelect value={difficulty} onChange={setDifficulty} />
      </div>
      <Textarea
        label="Content"
        hint="Shown to students as plain text. Line breaks are kept."
        rows={12}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={50000}
        required
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting || !valid}>
          {submitting ? "Saving..." : "Save lesson"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
