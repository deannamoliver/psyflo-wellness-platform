import {
  CirclePlus,
  ExternalLink,
  Headphones,
  Info,
  Mail,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/lib/core-ui/button";

export default function Support({
  basePath = "/dashboard/student",
}: {
  basePath?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Emergency Resources Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <CirclePlus className="h-5 w-5 text-[#EF4444]" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">
            Emergency Resources
          </h3>
        </div>
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" />
            <div>
              <p className="font-medium text-red-900 text-sm">
                Important Notice
              </p>
              <p className="mt-1 text-red-800 text-sm">
                Feelwell is not an emergency service. If you're experiencing a
                mental health crisis, please contact your local emergency
                services or a crisis hotline immediately.
              </p>
            </div>
          </div>
        </div>
        <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
          <Link href={`${basePath}/settings?tab=resources`}>
            View Emergency Resources
          </Link>
        </Button>
      </div>

      {/* Contact Support Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Headphones className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">
            Contact Support
          </h3>
        </div>
        <p className="mb-4 text-gray-600 text-sm">
          Our support team is here to help you with any questions or issues you
          may have. We typically respond within 24 hours.
        </p>
        <Button
          asChild
          className="mb-3 bg-blue-600 text-white hover:bg-blue-700"
        >
          <Link href="mailto:hello@psyflo.com">Email Support</Link>
        </Button>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Mail className="h-4 w-4" />
          <span>hello@psyflo.com</span>
        </div>
      </div>

      {/* Send Feedback Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">Send Feedback</h3>
        </div>
        <p className="mb-4 text-gray-600 text-sm">
          Help us improve by sharing your thoughts, suggestions, or reporting
          bugs. Your feedback shapes our product.
        </p>
        <Button
          asChild
          className="bg-purple-600 text-white hover:bg-purple-700"
        >
          <Link
            href="https://forms.office.com/pages/responsepage.aspx?id=u4pbkScTuUK6RyHUfp2wu8dChQBBTjFLg9EndPNrRGVURFFGQzFEWklDOFdNMDZGRlNaSFM5VklCMCQlQCN0PWcu&route=shorturl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Feedback Form
          </Link>
        </Button>
      </div>
    </div>
  );
}
