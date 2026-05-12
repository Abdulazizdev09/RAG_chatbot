"use client"

import React, { useRef } from "react"

interface UploadModalProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (file: File) => void
    isLoading: boolean
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload, isLoading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

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
        if (files?.[0]) {
            onUpload(files[0])
        }
    }

    if (!isOpen) return null

    return (
        <div className="upload-panel" onClick={onClose}>
            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="upload-modal-header">Upload FAQ Document</h2>

                <div className="upload-modal-content">
                    <div
                        className="file-input-area"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.pdf,.md"
                            onChange={handleFileSelect}
                            disabled={isLoading}
                        />
                        <div style={{ fontSize: "24px", marginBottom: "8px" }}>📄</div>
                        <p style={{ margin: "0 0 4px 0", fontSize: "14px" }}>
                            Drag and drop your file here
                        </p>
                        <p style={{ margin: "0", fontSize: "12px", color: "var(--text-tertiary)" }}>
                            or click to browse (TXT, PDF, Markdown)
                        </p>
                    </div>

                    <div className="modal-buttons">
                        <button
                            className="modal-button"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {isLoading && (
                    <p
                        style={{
                            textAlign: "center",
                            color: "var(--text-secondary)",
                            fontSize: "12px",
                            marginTop: "12px",
                        }}
                    >
                        Processing...
                    </p>
                )}
            </div>
        </div>
    )
}

export default UploadModal
