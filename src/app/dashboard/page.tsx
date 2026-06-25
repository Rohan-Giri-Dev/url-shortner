import DashboardExperience from "../components/DashboardExperience";

export default function DashboardPage() {
  return (
    <DashboardExperience
      apiPath="/api/urls"
      scopeLabel="Public workspace"
      headline="Shorten links without breaking your flow."
      emptyMessage="No public links yet"
    />
  );
}
