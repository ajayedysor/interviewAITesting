"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Video, CheckCircle, ArrowRight, BarChart3, BookOpen, Target } from "lucide-react"
import { Button } from "./ui/button"

export function EndMeeting() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (countdown === 0) {
      router.push("/dashboard")
    }
  }, [countdown, router])

  const goToDashboard = () => {
    window.location.href = "/dashboard"
  }



  return (
    <div className="min-h-screen bg-white">
      {/* Header - Same as preview screen */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-normal text-gray-700">Meet</span>
          </div>

          {/* Timer in header */}
          <div className="flex items-center space-x-2 ml-8">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {countdown}
            </div>
            <span className="text-sm text-gray-600">Returning to home screen</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">muskan@muskan.ai</span>
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
            E
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="text-center max-w-4xl w-full">
          {/* Success Icon and Title */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-semibold text-gray-900 mb-4">Interview Completed Successfully</h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Your responses have been submitted and saved securely.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mt-2">
              Thank you for your time and effort — every step you take brings you closer to your study abroad goal.
            </p>
          </div>

          {/* Next Steps Section */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <ArrowRight className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900">You can now return to your dashboard to:</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* View Progress */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">View your progress</h3>
                <p className="text-gray-600 text-sm">Track your interview performance and scores</p>
              </div>

              {/* Review Feedback */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Review instructions or feedback</h3>
                <p className="text-gray-600 text-sm">Access detailed evaluation reports and tips</p>
              </div>

              {/* Keep Preparing */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Keep preparing and researching</h3>
                <p className="text-gray-600 text-sm">Continue learning about your course and university</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-center">
            <Button
              onClick={goToDashboard}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Return to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
