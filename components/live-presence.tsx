"use client"

import { useEffect } from "react"
import { liveInit } from "@/lib/live-track"

export function LivePresence() {
  useEffect(() => {
    liveInit().catch(() => {})
  }, [])
  return null
}
