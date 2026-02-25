"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Props {
  username: string;
  avatar?: string | null;
}

export default function UserDropdown({ username, avatar }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full border border-[#1e1e1e] bg-[#0f0f0f] px-3 py-1.5 hover:border-[#2e2e2e] transition-colors"
      >
        {avatar ? (
          <Image
            src={avatar}
            alt={username}
            width={22}
            height={22}
            className="rounded-full"
          />
        ) : (
          <div className="h-[22px] w-[22px] rounded-full bg-[#f97316]/20 flex items-center justify-center text-xs font-bold text-[#f97316]">
            {username[0]?.toUpperCase()}
          </div>
        )}
        <span className="hidden sm:block text-sm text-[#a0a0a0] font-mono leading-none">
          @{username}
        </span>
        <ChevronIcon
          className={`h-3 w-3 text-[#505050] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden z-50">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-[#1a1a1a]">
            <p className="text-xs text-[#505050]">Signed in as</p>
            <p className="text-sm font-mono font-semibold text-[#f0f0f0] truncate mt-0.5">
              @{username}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <DropdownLink href={`/browse?namespace=${username}`} onClick={() => setOpen(false)}>
              <PackageIcon className="h-4 w-4" />
              My skills
            </DropdownLink>
            <DropdownLink href="/upload" onClick={() => setOpen(false)}>
              <UploadIcon className="h-4 w-4" />
              Publish skill
            </DropdownLink>
            <DropdownLink
              href={`https://github.com/${username}`}
              onClick={() => setOpen(false)}
              external
            >
              <GitHubIcon className="h-4 w-4" />
              GitHub profile
            </DropdownLink>
          </div>

          {/* Sign out */}
          <div className="border-t border-[#1a1a1a] py-1">
            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#707070] hover:bg-[#161616] hover:text-[#f87171] transition-colors"
            >
              <SignOutIcon className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownLink({
  href,
  onClick,
  external,
  children,
}: {
  href: string;
  onClick: () => void;
  external?: boolean;
  children: React.ReactNode;
}) {
  const cls =
    "flex items-center gap-3 px-4 py-2.5 text-sm text-[#a0a0a0] hover:bg-[#161616] hover:text-[#f0f0f0] transition-colors";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={cls}>
      {children}
    </Link>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 5l6-3 6 3v6l-6 3-6-3V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 2v14M2 5l6 3 6-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 10V2M5 5l3-3 3 3M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
