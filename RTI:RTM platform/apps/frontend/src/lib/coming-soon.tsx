import Image from "next/image";
import { H3 } from "./core-ui/typography";

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        src="/coming-soon.png"
        alt="Coming Soon"
        width={160}
        height={160}
      />
      <H3>Coming Soon!</H3>
    </div>
  );
}
