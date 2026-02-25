"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeletePackageButtonProps {
  namespace: string;
  name: string;
  isOwner: boolean;
}

export default function DeletePackageButton({
  namespace,
  name,
  isOwner,
}: DeletePackageButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isOwner) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/packages/${namespace}/${name}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/browse");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete package");
        setDeleting(false);
        setShowConfirm(false);
      }
    } catch {
      alert("Network error. Please try again.");
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm text-red-400 mb-3">
          Are you sure? This will permanently delete this package and all its files.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={deleting}
            className="flex-1 rounded-lg border border-[#1e1e1e] px-3 py-2 text-sm font-semibold text-[#707070] hover:text-[#f0f0f0] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#505050] mb-3">
        Danger Zone
      </p>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
      >
        Delete Package
      </button>
    </div>
  );
}
