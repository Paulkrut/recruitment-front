"use client";
import { useEffect } from "react";

export default function RootRedirect() {
  useEffect(() => {
    const token = localStorage.getItem("recruitment_token");
    const target = token ? "/hr" : "/login";
    window.location.replace(target);
  }, []);
  return null;
}
