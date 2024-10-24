import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function AdBanner() {
  return (
    <div className="bg-primary/10 py-2 text-center text-sm">
      <Link
        href="https://hikarinova.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center hover:underline"
      >
        Check out our sponsor: Hikari Nova
        <ExternalLink className="ml-1 h-3 w-3" />
      </Link>
    </div>
  );
}
