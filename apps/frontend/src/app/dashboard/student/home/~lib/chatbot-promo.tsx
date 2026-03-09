import Image from "next/image";
import Link from "next/link";
import { Small } from "@/lib/core-ui/typography";

function Shadow({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 25 14"
      className={className}
      {...props}
    >
      <ellipse
        cx={12.5}
        cy={4.375}
        fill="#41AFFE"
        fillOpacity={0.3}
        rx={12.5}
        ry={4.375}
        transform="matrix(-1 0 0 1 25 0)"
      />
    </svg>
  );
}

export function ChatbotPromo() {
  return (
    <Link
      href="/dashboard/student/chat"
      className="flex items-center justify-end"
    >
      <div className="flex items-center gap-2">
        <div className="w-2xs rounded-xl border bg-white p-4 text-center">
          <Small>
            Want to chat about school,{" "}
            <span className="text-orange-400">relationships,</span> or{" "}
            <span className="text-green-800">anything else?</span>
          </Small>
        </div>
        <div className="flex flex-col items-center">
          <Image
            src="/home/chatbot-icon.png"
            alt="Chatbot"
            className="mb-2 w-14"
            width={56}
            height={56}
          />
          <Shadow className="mb-2 w-14" />
        </div>
      </div>
    </Link>
  );
}
