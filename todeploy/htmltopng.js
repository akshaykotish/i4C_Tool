// Make sure to include html2canvas by adding this script to your HTML file:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

async function convertHtmlToFullHdPng() {
  try {
    // Use html2canvas to capture the whole page
    const canvas = await html2canvas(document.body, {
      width: 1920,
      height: 1080,
      windowWidth: document.body.scrollWidth,
      windowHeight: document.body.scrollHeight,
      scale: 1, // Set scale to 1 to avoid doubling the size in Full HD
    });

    // Convert the canvas to PNG
    const imgData = canvas.toDataURL("image/png");

    // Create a link to download the image
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "full_hd_image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error capturing HTML page as PNG:", error);
  }
}

