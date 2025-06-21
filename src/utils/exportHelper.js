/**
 * Exports a Chart.js instance to an image format (e.g., 'webp', 'png').
 * @param {Chart} chart - The Chart.js instance.
 * @param {string} format - The image format ('webp', 'png', etc.).
 * @param {string} filename - The desired filename for the download.
 */
function exportChartAsImage(chart, format, filename) {
    if (!chart) {
        alert('No chart available to export.');
        return;
    }

    const mimeType = `image/${format}`;
    const canvas = chart.canvas;

    // Create a temporary canvas with a white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = '#111827'; // Use a dark background similar to the theme
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    const dataUrl = tempCanvas.toDataURL(mimeType);
    const link = document.createElement('a');
    link.setAttribute('href', dataUrl);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exports a Chart.js instance to an SVG file.
 * Requires canvas2svg.js to be loaded.
 * @param {Chart} chart - The Chart.js instance.
 * @param {string} filename - The desired filename for the download.
 */
function exportChartAsSVG(chart, filename) {
    if (!chart) {
        alert('No chart available to export.');
        return;
    }
    if (typeof C2S === 'undefined') {
        console.error('canvas2svg.js is not loaded. SVG export is unavailable.');
        alert('SVG export functionality is not available.');
        return;
    }

    const { canvas, config } = chart;
    const { type, data, options } = config;

    const exportOptions = JSON.parse(JSON.stringify(options));
    exportOptions.animation = { duration: 0 };
    exportOptions.responsive = false;
    exportOptions.maintainAspectRatio = false;

    const svgContext = new C2S(canvas.width, canvas.height);
    const tempChart = new Chart(svgContext, {
        type,
        data,
        options: exportOptions,
    });

    const svg = svgContext.getSerializedSvg();
    tempChart.destroy(); // Clean up the temporary chart instance

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exports an array of objects to a CSV file.
 * @param {Array<Object>} data - The array of data objects to export.
 * @param {Object} headers - An object mapping data keys to CSV header titles.
 * @param {string} filename - The desired filename for the download.
 */
function exportDataAsCSV(data, headers, filename) {
    if (!data || data.length === 0) {
        alert('No data available to export.');
        return;
    }

    const dataKeys = Object.keys(headers);
    const headerTitles = Object.values(headers);

    let csvContent = headerTitles.map(title => `"${title}"`).join(',') + '\n';

    data.forEach(item => {
        const row = dataKeys.map(key => {
            let value = item[key] || '';
            // Escape double quotes by doubling them
            value = String(value).replace(/"/g, '""');
            return `"${value}"`;
        }).join(',');
        csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}