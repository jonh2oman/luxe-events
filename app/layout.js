import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Luxe Events | Premium Concerts & Event Planning",
  description: "Experience high-end event planning, live seating maps, real-time chats, and AI-driven creator analytics.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          {/* Main Content wrapper */}
          <div style={{ minHeight: "calc(100vh - 120px)", paddingBottom: "60px" }}>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
