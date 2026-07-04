import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Ingresar — Panel de redacción" };

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
