import type { Difficulty } from "../../types/learning.types";
import Select from "../common/Select";

interface Props {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
}

export default function DifficultySelect({ value, onChange }: Props) {
  return (
    <Select
      label="Difficulty"
      value={value}
      onChange={(e) => onChange(e.target.value as Difficulty)}
    >
      <option value="BEGINNER">Beginner</option>
      <option value="INTERMEDIATE">Intermediate</option>
      <option value="ADVANCED">Advanced</option>
    </Select>
  );
}
