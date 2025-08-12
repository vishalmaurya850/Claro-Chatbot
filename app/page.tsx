import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { LandingPage } from "@/components/landing-page"

type SessionUser = {
  role: string;
  [key: string]: any;
};

type Session = {
  user: SessionUser;
  [key: string]: any;
} | null;

export default async function Home() {
  const session: Session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/chat");
    }
  }

  return <LandingPage />;
}
