export default function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Integración de Pedidos</h1>
    <p>Sube tu archivo PDF o Excel:</p>
    <input type="file" id="fileInput" />
    <pre id="output"></pre>
  `;

  document.getElementById('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    document.getElementById('output').textContent = 'Archivo cargado: ' + file.name + '\n(Procesamiento simulado)';
    // Aquí se integrará la lógica real: lectura PDF/XLSX, comparación con base, exportación
  });
}