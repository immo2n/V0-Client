import { useState, useEffect, useRef } from "react";
import { File, Copy, Check, Download, Code, Archive } from "lucide-react";
import JSZip from "jszip";
import "../styles/FileViewer.css";

function FileViewer({ files }) {
  console.log(files);

  // Track the master file list to preserve initial file structure
  const [masterFiles, setMasterFiles] = useState([]);
  const prevFilesRef = useRef(null);

  // Normalize incoming files to handle different formats from V0 API
  const normalizeFile = (file) => {
    if (file.name && file.content) {
      // Format 1: {name, content, type, size} - initial format
      if (file.type && file.size) {
        return {
          name: file.name,
          content: file.content,
          type: file.type,
          size: file.size,
        };
      }
      // Format 3: {name, content, locked, object} - follow-up format
      else if (file.object === "file") {
        // Determine type from file extension
        const extension = file.name.split(".").pop()?.toLowerCase();
        const type =
          extension === "tsx"
            ? "tsx"
            : extension === "jsx"
            ? "jsx"
            : extension === "ts"
            ? "typescript"
            : extension === "js"
            ? "javascript"
            : extension === "css"
            ? "css"
            : extension === "html"
            ? "html"
            : extension === "json"
            ? "json"
            : extension === "md"
            ? "markdown"
            : "text";

        return {
          name: file.name,
          content: file.content,
          type: type,
          size: file.content?.length || 0,
        };
      }
      // Fallback for other formats
      else {
        const extension = file.name.split(".").pop()?.toLowerCase();
        const type =
          extension === "tsx"
            ? "tsx"
            : extension === "jsx"
            ? "jsx"
            : extension === "ts"
            ? "typescript"
            : extension === "js"
            ? "javascript"
            : extension === "css"
            ? "css"
            : extension === "html"
            ? "html"
            : extension === "json"
            ? "json"
            : extension === "md"
            ? "markdown"
            : "text";

        return {
          name: file.name,
          content: file.content,
          type: type,
          size: file.content?.length || 0,
        };
      }
    } else if (file.lang && file.source) {
      // Format 2: {lang, meta, source} - convert to Format 1
      const fileName = file.meta?.file || `file.${file.lang}`;
      return {
        name: fileName,
        content: file.source,
        type: file.lang,
        size: file.source?.length || 0,
      };
    }
    return null;
  };

  // Process incoming files and merge with master files
  useEffect(() => {
    if (!files || files.length === 0) {
      setMasterFiles([]);
      return;
    }

    const incomingFiles = files.map(normalizeFile).filter(Boolean);

    setMasterFiles((prevMasterFiles) => {
      // If this is the first time or files are completely different, replace
      if (
        prevFilesRef.current === null ||
        prevMasterFiles.length === 0 ||
        !prevFilesRef.current.some((prevFile) =>
          incomingFiles.some((newFile) => newFile.name === prevFile.name)
        )
      ) {
        prevFilesRef.current = incomingFiles;
        return incomingFiles;
      }

      // Otherwise, merge: update existing files, add new ones
      const mergedFiles = [...prevMasterFiles];

      incomingFiles.forEach((newFile) => {
        const existingIndex = mergedFiles.findIndex(
          (existing) => existing.name === newFile.name
        );
        if (existingIndex >= 0) {
          // Update existing file with new content
          mergedFiles[existingIndex] = {
            ...mergedFiles[existingIndex],
            content: newFile.content,
            size: newFile.size,
            type: newFile.type,
          };
        } else {
          // Add new file
          mergedFiles.push(newFile);
        }
      });

      prevFilesRef.current = incomingFiles;
      return mergedFiles;
    });
  }, [files]);

  // Filter out invalid files and set initial selection
  const validFiles = masterFiles.filter(
    (file) => file && file.name && typeof file.name === "string"
  );
  const [selectedFile, setSelectedFile] = useState(validFiles?.[0] || null);
  const [copiedFile, setCopiedFile] = useState(null);

  // Update selected file when valid files change
  useEffect(() => {
    if (validFiles.length > 0 && !selectedFile) {
      setSelectedFile(validFiles[0]);
    } else if (validFiles.length === 0) {
      setSelectedFile(null);
    }
  }, [validFiles, selectedFile]);

  const copyToClipboard = async (content, fileName) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadFile = (file) => {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadProject = async () => {
    if (!validFiles || validFiles.length === 0) {
      console.warn("No files to download");
      return;
    }

    try {
      const zip = new JSZip();

      // Add all files to the zip
      validFiles.forEach((file) => {
        if (file.name && file.content) {
          zip.file(file.name, file.content);
        }
      });

      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating zip file:", error);
      alert("Failed to create zip file. Please try again.");
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName || typeof fileName !== "string") {
      return "📄";
    }
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return "📄";
      case "css":
      case "scss":
        return "🎨";
      case "html":
        return "🌐";
      case "json":
        return "📋";
      case "md":
        return "📝";
      default:
        return "📄";
    }
  };

  const getFileLanguage = (fileName) => {
    if (!fileName || typeof fileName !== "string") {
      return "text";
    }
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "js":
        return "javascript";
      case "jsx":
        return "jsx";
      case "ts":
        return "typescript";
      case "tsx":
        return "tsx";
      case "css":
        return "css";
      case "scss":
        return "scss";
      case "html":
        return "html";
      case "json":
        return "json";
      case "md":
        return "markdown";
      default:
        return "text";
    }
  };

  if (!masterFiles || masterFiles.length === 0 || validFiles.length === 0) {
    return (
      <div className="file-viewer">
        <div className="empty-state">
          <File size={48} />
          <h3>No files available</h3>
          <p>Create a chat to see generated files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-viewer">
      <div className="file-viewer-header">
        <div className="header-content">
          <h2>
            <Code size={24} />
            Generated Files ({validFiles.length})
          </h2>
          <p>Browse and download the files created by V0</p>
        </div>
        <div className="header-actions">
          <button
            className="download-project-button"
            onClick={downloadProject}
            title="Download all files as ZIP"
          >
            <Archive size={16} />
            Download Project
          </button>
        </div>
      </div>

      <div className="file-viewer-content">
        <div className="file-list">
          <h3>Files</h3>
          <div className="file-items">
            {validFiles.map(
              (file, index) =>
                file.type &&
                file.size &&
                file.name &&
                file.content && (
                  <div
                    key={index}
                    className={`file-item ${
                      selectedFile === file ? "active" : ""
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <span className="file-icon">{getFileIcon(file.name)}</span>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        {file.type.toUpperCase()} •{" "}
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>

        <div className="file-content">
          {selectedFile ? (
            <>
              <div className="file-header">
                <div className="file-title">
                  <span className="file-icon">
                    {getFileIcon(selectedFile.name)}
                  </span>
                  <span className="file-name">{selectedFile.name}</span>
                </div>
                <div className="file-actions">
                  <button
                    className="action-button"
                    onClick={() =>
                      copyToClipboard(selectedFile.content, selectedFile.name)
                    }
                    title="Copy to clipboard"
                  >
                    {copiedFile === selectedFile.name ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <button
                    className="action-button"
                    onClick={() => downloadFile(selectedFile)}
                    title="Download file"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              <div className="code-container">
                <pre
                  className={`code-block language-${getFileLanguage(
                    selectedFile.name
                  )}`}
                >
                  <code>{selectedFile.content}</code>
                </pre>
              </div>
            </>
          ) : (
            <div className="empty-content">
              <Code size={48} />
              <h3>Select a file to view</h3>
              <p>Choose a file from the list to see its contents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileViewer;
