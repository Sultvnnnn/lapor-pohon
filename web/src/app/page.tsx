import { reportForm as ReportForm } from "@/components/reportForm";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Uji Coba Sistem LaporPohon
      </h1>
      <ReportForm />
    </main>
  );
}
