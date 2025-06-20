
import { exportToExcel } from './utils.js';

export default function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Integración de Pedidos</h1>
    <p>Pedido #: <input type="text" id="pedidoInput" placeholder="ej. 474" /></p>
    <p>Sube tu archivo PDF o Excel:</p>
    <input type="file" id="fileInput" />
    <button id="generar" disabled>Generar Excel</button>
    <pre id="output"></pre>
  `;

  let skus = [];

  // Leer Google Sheet como CSV
  const sheetId = '1phjH7lGHNm9wcd6pEafQNDowrT_e2QVyzjQXRfANGeQ';
  const gid = '0';
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&id=${sheetId}&gid=${gid}`;

  fetch(url)
    .then(response => response.text())
    .then(csvText => {
      skus = csvText
        .split('\n')
        .map(row => row.trim().toLowerCase())
        .filter(r => r && !r.includes('sku'));
      document.getElementById('output').textContent = 'Base de SKUs cargada: ' + skus.length + ' registros';
      document.getElementById('generar').disabled = false;
    })
    .catch(err => {
      document.getElementById('output').textContent = 'Error al cargar Google Sheet: ' + err;
    });

  let uploadedFile = null;

  document.getElementById('fileInput').addEventListener('change', async (e) => {
    uploadedFile = e.target.files[0];
    document.getElementById('output').textContent += `\nArchivo cargado: ${uploadedFile.name}`;
  });

  document.getElementById('generar').addEventListener('click', async () => {
    const pedido = document.getElementById('pedidoInput').value.trim();
    if (!pedido || !uploadedFile) {
      alert('Falta ingresar número de pedido o subir archivo');
      return;
    }

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
        const colors = ['black', 'blue', 'pink', 'navy', 'grey', 'purple'];

        let currentModel = null;

        rows.forEach((row, index) => {
          if (index < 2) return;

          const ctn = String(row[0] || '').trim();
          const rawModel = String(row[1] || '').toLowerCase().replaceAll(' ', '');

          if (ctn && rawModel && !rawModel.includes('total')) {
            currentModel = rawModel;
          } else if (!ctn && rawModel && !rawModel.includes('total')) {
            currentModel = rawModel;
          } else {
            return;
          }

          const fullModel = `${pedido}-${currentModel}`;

          colors.forEach((color, idx) => {
            const qty = row[idx + 2];
            if (!qty || isNaN(qty)) return;

            const foundSku = skus.find(sku => sku.includes(fullModel) && sku.includes(color));
            if (foundSku) {
              counts[foundSku] = (counts[foundSku] || 0) + Number(qty);
            }
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
