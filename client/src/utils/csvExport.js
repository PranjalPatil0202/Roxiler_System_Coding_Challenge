import * as XLSX from 'xlsx';

/**
 * Triggers an authenticated API download according to strict browser standards:
 * 1. Make the authenticated API request correctly.
 * 2. Check response.ok before downloading anything.
 * 3. If the response is an error, display the actual error instead of downloading it as a file.
 * 4. Convert the successful response into a Blob.
 * 5. Verify that the Blob is not empty.
 * 6. Extract the filename from the Content-Disposition response header when available.
 * 7. Use a fallback filename ending in .csv if the header is unavailable.
 * 8. Create a temporary <a> element.
 * 9. Set: link.href = objectUrl, link.download = filename
 * 10. Append the link to document.body.
 * 11. Trigger link.click().
 * 12. Remove the link.
 * 13. Revoke the Blob URL only after a safe delay.
 */
export const downloadCSVFromAPI = async (endpoint, fallbackFilename = 'export.csv', token = null) => {
  // 1. Make the authenticated API request correctly
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
  });

  // 2. Check response.ok before downloading anything
  if (!response.ok) {
    // 3. If the response is an error, display the actual error instead of downloading it as a file
    let errorMessage = `Export failed with HTTP status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      } catch {
        // use default message
      }
    }
    throw new Error(errorMessage);
  }

  // 4. Convert the successful response into a Blob
  const blob = await response.blob();

  // 5. Verify that the Blob is not empty
  if (!blob || blob.size === 0) {
    throw new Error('Downloaded file is empty (0 bytes).');
  }

  // 6. Extract the filename from the Content-Disposition response header when available
  let filename = fallbackFilename;
  const contentDisposition = response.headers.get('content-disposition');
  if (contentDisposition) {
    // Match RFC 6266 filename or RFC 5987 filename*
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i;
    const matches = filenameRegex.exec(contentDisposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '').trim();
      try {
        filename = decodeURIComponent(filename);
      } catch {
        // keep decoded name
      }
    }
  }

  // 7. Use a fallback filename ending in .csv if the header is unavailable
  if (!filename || !filename.toLowerCase().endsWith('.csv')) {
    filename = (filename || fallbackFilename).replace(/\.[^/.]+$/, '') + '.csv';
  }

  // 8. Create a temporary <a> element
  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);

  // 9. Set link.href = objectUrl, link.download = filename
  link.href = objectUrl;
  link.download = filename;
  link.setAttribute('download', filename);

  // Keep link in layout tree so Chromium treats the click as an official layout download
  link.style.position = 'fixed';
  link.style.left = '-9999px';
  link.style.top = '-9999px';
  link.style.opacity = '0';

  // 10. Append the link to document.body
  document.body.appendChild(link);

  // 11. Trigger link.click()
  link.click();

  // 12. Remove the link
  document.body.removeChild(link);

  // 13. Revoke the Blob URL only after a safe delay
  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 2000);

  return { filename, size: blob.size };
};

/**
 * Client-side fallback export utility
 */
export const exportToCSV = (data = [], columns = [], filename = 'export') => {
  if (!data || data.length === 0) {
    alert('No data available to export');
    return;
  }

  try {
    const headers = columns
      .map((col) => `"${String(col.label || col.key).replace(/"/g, '""')}"`)
      .join(',');

    const rows = data.map((row) => {
      return columns
        .map((col) => {
          let val;
          if (typeof col.getValue === 'function') {
            val = col.getValue(row);
          } else {
            val = row[col.key];
            if (val === undefined && col.key.includes('_')) {
              const camelKey = col.key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
              val = row[camelKey];
            }
          }

          if (val === null || val === undefined) {
            val = '';
          } else if (typeof val === 'object') {
            val = JSON.stringify(val);
          } else {
            val = String(val).replace(/[\r\n]+/g, ' ').trim();
          }

          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = [headers, ...rows].join('\r\n');
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}.csv`;

    const fullCsv = '\uFEFF' + csvContent;
    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fullFilename;
    link.setAttribute('download', fullFilename);
    link.style.position = 'fixed';
    link.style.left = '-9999px';
    link.style.top = '-9999px';
    link.style.opacity = '0';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 2000);
  } catch (error) {
    console.error('Failed to export CSV file:', error);
    alert('Error generating CSV file. Please try again.');
  }
};

/**
 * Export data to native Microsoft Excel (.xlsx) workbook
 */
export const exportToExcel = (data = [], columns = [], filename = 'export') => {
  if (!data || data.length === 0) {
    alert('No data available to export');
    return;
  }

  try {
    const formattedRows = data.map((row) => {
      const rowObj = {};
      columns.forEach((col) => {
        let val;
        if (typeof col.getValue === 'function') {
          val = col.getValue(row);
        } else {
          val = row[col.key];
          if (val === undefined && col.key.includes('_')) {
            const camelKey = col.key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
            val = row[camelKey];
          }
        }
        rowObj[col.label || col.key] = val !== undefined && val !== null ? val : '';
      });
      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Directory');

    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fullFilename);
  } catch (error) {
    console.error('Failed to export Excel file:', error);
    exportToCSV(data, columns, filename);
  }
};

export default exportToCSV;
