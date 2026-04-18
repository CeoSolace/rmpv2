"use client";

import Header from "../components/Header";
import AuthForm from "../components/AuthForm";
import HomeFeed from "../components/HomeFeed";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

export default function Page() {
  const { user, loading } = useAuth();

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4">
        {loading ? <LoadingSpinner /> : user ? <HomeFeed /> : <AuthForm />}
      </main>
    </>
  );
}
