import PanelLayout from "@/components/shared/PanelLayout";

export default function TestPage() {
  return (
    <PanelLayout title="Test" allowedRoles={["HR", "ADMIN"]}>
      <div className="p-20 text-4xl font-black">TEST ROUTE ACTIVE</div>
    </PanelLayout>
  );
}
