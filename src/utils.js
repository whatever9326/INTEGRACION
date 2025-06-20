
export function exportToExcel(counts) {
  const headers = Object.keys(counts);
  const row = headers.map(h => counts[h]);
  const data = [headers, row];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SKUs');

  XLSX.writeFile(workbook, 'resultado.xlsx');
}
