import type { Metadata, Viewport } from "next";
import { Poppins, Raleway, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Nav } from "@/components/nav";
import { AnimatedBackground } from "@/components/animated-background";
import { AUTH_COOKIE, isValidSessionToken } from "@/lib/auth";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gestão · Tráfego Real",
  description: "Ferramenta interna de gestão de clientes.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const authenticated = await isValidSessionToken(cookieStore.get(AUTH_COOKIE)?.value);

  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} ${raleway.variable} ${inter.variable} h-full dark`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-brand-black text-white antialiased">
        <AnimatedBackground />
        <Nav authenticated={authenticated} />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
