"use client";

import Header from "../../components/Header";
import AuthForm from "../../components/AuthForm";

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4">
        <AuthForm />
      </main>
    </>
  );
}
