import QRCodeDisplay from "./QRCodeDisplay";

export default function QRPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070a0f] p-6">
      <QRCodeDisplay url="https://example.com" size={200} />
    </main>
  );
}
