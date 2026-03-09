import { H4 } from "@/lib/core-ui/typography";
import { getCurrentUserInfo } from "@/lib/user/info";

export default async function WelcomeHeader() {
  const data = await getCurrentUserInfo();

  return (
    <div>
      <H4>
        WELCOME BACK,{" "}
        <span className="text-2xl text-blue-800">{data.firstName}</span>
      </H4>
    </div>
  );
}
