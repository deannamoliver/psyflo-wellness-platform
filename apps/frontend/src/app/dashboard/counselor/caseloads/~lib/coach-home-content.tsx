export function CoachHomeContent({
  alertNotifications,
  activeConversations,
}: {
  alertNotifications: React.ReactNode;
  activeConversations: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">{alertNotifications}</div>
      <div className="lg:col-span-2">{activeConversations}</div>
    </div>
  );
}
