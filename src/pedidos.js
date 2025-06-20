
import { exportToExcel } from './utils.js';

export default function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Integración de Pedidos</h1>
    <p>Sube tu archivo PDF o Excel:</p>
    <input type="file" id="fileInput" />
    <button id="generar" disabled>Generar Excel</button>
    <pre id="output"></pre>
  `;

  let skus = [];

  // Cargar datos desde Google Sheets
  window.Tabletop.init({
    key: 'https://docs.google.com/spreadsheets/d/1phjH7lGHNm9wcd6pEafQNDowrT_e2QVyzjQXRfANGeQ/edit?usp=sharing',
    simpleSheet: true,
    callback: function(data) {
      skus = data.map(row => row.SKU?.toLowerCase());
      document.getElementById('output').textContent = 'Base de SKUs cargada con ' + skus.length + ' registros.';
      document.getElementById('generar').disabled = false;
    }
  });

  let uploadedFile = null;

  document.getElementById('fileInput').addEventListener('change', async (e) => {
    uploadedFile = e.target.files[0];
    document.getElementById('output').textContent += `\nArchivo cargado: ${uploadedFile.name}`;
  });

  document.getElementById('generar').addEventListener('click', async () => {
    if (!uploadedFile) return;

    const filename = uploadedFile.name.toLowerCase();
    const isExcel = filename.endsWith('.xlsx') || filename.endsWith('.xls');

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (isExcel) {
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const counts = {};

        rows.forEach(row => {
          const model = String(row[0] || '').toLowerCase().replaceAll(' ', '');
          const colors = ['black', 'blue', 'pink', 'navy', 'grey', 'purple'];

          colors.forEach((color, idx) => {
            const qty = row[idx + 1];
            if (!qty || isNaN(qty)) return;

            const foundSku = skus.find(sku => sku.includes(model) && sku.includes(color));
            const key = foundSku || `${model}-${color}`;
            counts[key] = (counts[key] || 0) + Number(qty);
          });
        });

        exportToExcel(counts);
      } else {
        document.getElementById('output').textContent += '\nError: procesamiento de PDF no está activo en esta demo.';
      }
    };
    reader.readAsBinaryString(uploadedFile);
  });
}
