import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Smart Garden Dashboard",
  description: "IoT Smart Garden Monitoring System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex bg-[#020617] text-slate-200">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
