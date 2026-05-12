"use client"

import React, { useRef } from "react"

interface UploadedFile {
    id: string
    name: string
    uploadedAt: string
    status: "success" | "failed" | "partial" | "canceled"
    chunksProcessed?: number
    totalChunks?: number
}

interface UploadModalProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (file: File) => void
    onCancel?: () => void
    uploadStatus?: "idle" | "uploading" | "processing" | "saving" | "completed" | "failed" | "canceled"
    uploadStatusText?: string
    uploadedFiles?: UploadedFile[]
}

const UploadModal: React.FC<UploadModalProps> = ({
    isOpen,
    onClose,
    onUpload,
    onCancel,
    uploadStatus = "idle",
    uploadStatusText = "",
    uploadedFiles = [],
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const isUploading = uploadStatus === "uploading" || uploadStatus === "processing" || uploadStatus === "saving"

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onUpload(file)
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        const files = e.dataTransfer.files
        if (files?.[0] && !isUploading) {
            onUpload(files[0])
        }
    }

    const getStatusColor = (status: string): string => {
        switch (status) {
            case "success":
                return "#22c55e"
            case "partial":
                return "#f59e0b"
            case "failed":
                return "#ef4444"
            case "canceled":
                return "#6b7280"
            default:
                return "#6b7280"
        }
    }

    const getStatusIcon = (status: string): string => {
        switch (status) {
            case "success":
                return "✓"
            case "partial":
                return "⚠"
            case "failed":
                return "✕"
            case "canceled":
                return "◯"
            default:
                return "◯"
        }
    }

    const formatTime = (isoString: string): string => {
        try {
            const date = new Date(isoString)
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        } catch {
            return isoString
        }
    }

    if (!isOpen) return null

    return (
        <div className="upload-panel" onClick={onClose}>
            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h2 className="upload-modal-header">Upload FAQ Document</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "24px",
                            cursor: "pointer",
                            padding: "0",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="upload-modal-content">
                    {uploadStatus === "idle" ? (
                        <>
                            <div
                                className="file-input-area"
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                style={{
                                    opacity: isUploading ? 0.5 : 1,
                                    pointerEvents: isUploading ? "none" : "auto",
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".txt,.pdf,.md"
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                />
                                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📄</div>
                                <p style={{ margin: "0 0 4px 0", fontSize: "14px" }}>
                                    Drag and drop your file here
                                </p>
                                <p style={{ margin: "0", fontSize: "12px", color: "var(--text-tertiary)" }}>
                                    or click to browse (TXT, PDF, Markdown)
                                </p>
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
                                    <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>
                                        📋 {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} uploaded
                                    </p>
                                    <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                                        {uploadedFiles.map((file) => (
                                            <div
                                                key={file.id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    padding: "8px",
                                                    backgroundColor: "var(--bg-secondary)",
                                                    borderRadius: "4px",
                                                    marginBottom: "6px",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                <span style={{ color: getStatusColor(file.status), fontWeight: "bold" }}>
                                                    {getStatusIcon(file.status)}
                                                </span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: "0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {file.name}
                                                    </p>
                                                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--text-tertiary)" }}>
                                                        {formatTime(file.uploadedAt)}
                                                        {file.chunksProcessed && ` • ${file.chunksProcessed}/${file.totalChunks} chunks`}
                                                    </p>
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: "11px",
                                                        color: "var(--text-tertiary)",
                                                        textTransform: "capitalize",
                                                    }}
                                                >
                                                    {file.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div style={{ fontSize: "32px", marginBottom: "12px", animation: "spin 1s linear infinite" }}>
                                ⏳
                            </div>
                            <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "500" }}>
                                {uploadStatusText === "uploading" && "Uploading..."}
                                {uploadStatusText === "processing" && "Processing file..."}
                                {uploadStatusText === "saving" && "Saving to database..."}
                                {uploadStatusText === "completed" && "✓ Upload completed!"}
                                {uploadStatusText === "failed" && "✕ Upload failed"}
                                {uploadStatusText === "canceled" && "◯ Upload canceled"}
                                {!uploadStatusText && "Processing..."}
                            </p>
                            <p style={{ margin: "0", fontSize: "12px", color: "var(--text-tertiary)" }}>
                                {uploadStatusText === "failed" || uploadStatusText === "canceled"
                                    ? "You can close this dialog or upload another file."
                                    : "Please wait, this may take a moment..."}
                            </p>
                        </div>
                    )}

                    <div className="modal-buttons" style={{ marginTop: "16px" }}>
                        {isUploading && (
                            <button className="modal-button" onClick={onCancel} style={{ flex: 1, marginRight: "8px" }}>
                                Cancel
                            </button>
                        )}
                        <button
                            className="modal-button"
                            onClick={onClose}
                            style={{ flex: 1 }}
                        >
                            {uploadStatus === "idle" ? "Cancel" : "Close"}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    )
}

export default UploadModal

