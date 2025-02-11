import { GridaLogo } from "@/components/grida-logo";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto mt-32 w-full max-w-container px-4 sm:px-6 lg:px-8">
      <hr />
      <div className="py-10">
        <div className="pt-8 flex flex-col items-center gap-7">
          <GridaLogo />
        </div>
      </div>
      <p className="mt-1 text-center text-sm leading-6 text-current">
        Grida Inc. All rights reserved.
      </p>
      <div className="mt-20 mb-16 flex items-center justify-center text-sm leading-6">
        <Link href="/privacy" className="text-muted-foreground">
          Privacy policy
        </Link>
      </div>
    </footer>
  );
}
