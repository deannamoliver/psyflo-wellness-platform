import TopNav from "./top-nav";

// Mock data for demo purposes
const MOCK_USER_NAME = "Practice Admin";
const MOCK_USER_INITIALS = "PA";
const MOCK_USER_EMAIL = "admin@practice.com";
const MOCK_PRACTICE_NAME = "Wellness Practice";

export default function TopNavWrapper() {
  return (
    <TopNav
      userName={MOCK_USER_NAME}
      userInitials={MOCK_USER_INITIALS}
      userEmail={MOCK_USER_EMAIL}
      practiceName={MOCK_PRACTICE_NAME}
    />
  );
}
