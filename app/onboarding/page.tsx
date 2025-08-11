"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import "./onboarding.css";

export default function Onboarding() {
  const router = useRouter();

  useEffect(() => {
    Cookies.set("onboarding_complete", "true", { expires: 365 });

    const timer = setTimeout(() => {
      router.push("/create-project");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="onboarding-container">
      <div className="shimmer">Welcome to SREVE</div>
    </div>
  );
}
