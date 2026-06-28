import { jsPDF } from "jspdf";

export default function ActionBar({ redactedText, filename, redactedPdfId }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(redactedText);
    alert("Redacted text copied to clipboard!");
  };

  const handleDownload = () => {
    if (redactedPdfId) {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const element = document.createElement("a");
      element.href = `${API_BASE}/download/${redactedPdfId}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const name = filename
        ? filename.replace(/\.[^/.]+$/, "") + "_redacted.pdf"
        : "redacted_output.pdf";

      const margin = 15;
      const pageHeight = doc.internal.pageSize.height;
      const maxLineWidth = 180;
      const lineHeight = 6;
      
      // Split the text to fit within the width of the page
      const splitText = doc.splitTextToSize(redactedText || "", maxLineWidth);

      let y = margin;
      for (let i = 0; i < splitText.length; i++) {
        // If the line goes beyond the page height, create a new page
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(splitText[i], margin, y);
        y += lineHeight;
      }
      doc.save(name);
    } catch (err) {
      console.error("PDF generation failed, falling back to TXT download:", err);
      // Fallback to text file download if PDF generation fails
      const element = document.createElement("a");
      const file = new Blob([redactedText], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      const name = filename
        ? filename.replace(/\.[^/.]+$/, "") + "_redacted.txt"
        : "redacted_output.txt";
      element.download = name;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={handleCopy}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
      >
        Copy to Clipboard
      </button>
      <button
        onClick={handleDownload}
        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
      >
        Download
      </button>
    </div>
  );
}

