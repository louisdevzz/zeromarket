import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignInButton } from "./AuthButton";
import UserDropdown from "./UserDropdown";

interface SessionUser {
  username: string;
  githubId: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default async function Navbar() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e1e1e] bg-[#080808]/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <ClawIcon className="h-7 w-7 text-[#f97316] transition-transform group-hover:rotate-12 duration-200" />
          <span className="font-bold text-lg tracking-tight">
            Zero<span className="text-[#f97316]">Market</span>
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-[#a0a0a0]">
          <Link href="/browse" className="hover:text-[#f0f0f0] transition-colors">Browse</Link>
          <Link href="/browse?tag=utility" className="hover:text-[#f0f0f0] transition-colors">Utilities</Link>
          <Link href="/browse?tag=devtools" className="hover:text-[#f0f0f0] transition-colors">DevTools</Link>
          <a
            href="https://github.com/zeroclaw-labs/zeroclaw"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f0f0f0] transition-colors"
          >
            GitHub
          </a>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/upload"
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#f97316]/40 px-4 py-1.5 text-sm font-semibold text-[#f97316] hover:bg-[#f97316]/10 transition-colors"
              >
                + Publish
              </Link>
              <UserDropdown
                username={user.username ?? user.name ?? "user"}
                avatar={user.image}
              />
            </>
          ) : (
            <SignInButton className="flex cursor-default items-center gap-2.5 rounded-full bg-[#f0f0f0] px-5 py-2 text-sm font-semibold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:shadow-[0_0_28px_rgba(249,115,22,0.4)]">
              <GitHubIcon className="h-4 w-4" />
              Sign in with GitHub
            </SignInButton>
          )}
        </div>
      </nav>
    </header>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function ClawIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Three claw strokes */}
      <path d="M7 3 C5 6 6 10 9 12 C7 15 7 19 9 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 2 C11 5 11 9 13 12 C12 15 12 19 14 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 3 C17 6 16 10 14 12 C15 15 16 19 15 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
