import Badge from "./Badge";

export default function RunStatusBadge({ status }: { status: "SUCCESS" | "FAILED" }) {
  return status === "SUCCESS" ? (
    <Badge tone="green">Success</Badge>
  ) : (
    <Badge tone="red">Failed</Badge>
  );
}
