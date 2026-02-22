"use client"

import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <div className="fixed bottom-0 right-0 z-[100] p-4 flex flex-col gap-2 w-full max-w-sm">
            <AnimatePresence>
                {toasts.map(function ({ id, title, description, action, variant = "default", onOpenChange, open, ...props }) {

                    let bgColor = "bg-white"
                    let textColor = "text-gray-900"
                    let borderColor = "border-gray-200"
                    let Icon = Info

                    if (variant === "destructive") {
                        bgColor = "bg-red-50"
                        textColor = "text-red-900"
                        borderColor = "border-red-200"
                        Icon = AlertCircle
                    } else if (variant === "success") {
                        bgColor = "bg-green-50"
                        textColor = "text-green-900"
                        borderColor = "border-green-200"
                        Icon = CheckCircle
                    }

                    return (
                        <motion.div
                            key={id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className={`flex items-start gap-4 p-4 rounded-lg border shadow-lg ${bgColor} ${borderColor} border`}
                            {...props}
                        >
                            <div className="flex-1">
                                {title && <div className={`font-semibold text-sm ${textColor}`}>{title}</div>}
                                {description && (
                                    <div className={`text-sm opacity-90 mt-1 ${textColor}`}>{description}</div>
                                )}
                            </div>
                            <button
                                className={`text-gray-500 hover:text-gray-900 transition-colors`}
                                onClick={() => dismiss(id)}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
