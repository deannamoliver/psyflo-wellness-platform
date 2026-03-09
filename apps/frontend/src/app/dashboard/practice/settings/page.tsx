import { serverSupabase } from "@/lib/database/supabase";
import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import ProviderSettingsClient from "../../counselor/settings/~lib/provider-settings-client";

export default async function SettingsPage() {
  const supabase = await serverSupabase();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userInfo = {
    firstName: user.user.user_metadata["first_name"] ?? "",
    lastName: user.user.user_metadata["last_name"] ?? "",
    email: user.user.email ?? "",
  };

  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Settings</PageTitle>
          <PageSubtitle>
            Manage your account settings and preferences.
          </PageSubtitle>
        </div>

        <ProviderSettingsClient userInfo={userInfo} />
      </PageContent>
    </PageContainer>
  );
}
