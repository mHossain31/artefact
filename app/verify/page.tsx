import { Suspense } from "react"
import { VerificationPage } from "@/components/auth/verification-page"

export default function Verify() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerificationPage />
      </Suspense>
    </div>
  )
}
