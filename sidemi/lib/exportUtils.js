import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
    // data should be an array of objects: [{ Col1: 'Val1', Col2: 'Val2' }, ...]
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (title, columns, data, filename, orientation = 'portrait') => {
    // columns: ['Header1', 'Header2']
    // data: [['Row1Col1', 'Row1Col2'], ...]
    const doc = new jsPDF({ orientation });
    doc.text(title, 14, 15);
    doc.autoTable({
        startY: 20,
        head: [columns],
        body: data,
    });
    doc.save(`${filename}.pdf`);
};
