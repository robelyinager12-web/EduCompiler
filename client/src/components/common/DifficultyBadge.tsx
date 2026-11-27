import type { Difficulty } from "../../types/learning.types";
import Badge from "./Badge";

const config: Record<Difficulty, { label: string; tone: "green" | "amber" | "red" }> = {
  BEGINNER: { label: "Beginner", tone: "green" },
  INTERMEDIATE: { label: "Intermediate", tone: "amber" },
  ADVANCED: { label: "Advanced", tone: "red" },
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const { label, tone } = config[difficulty];
  return <Badge tone={tone}>{label}</Badge>;
}
