import Navbar from "@/components/Navbar";

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
