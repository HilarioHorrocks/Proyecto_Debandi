import jsPDF from "jspdf"
import * as XLSX from "xlsx"

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  category: string
  image: string
  stock: number
  brand: string
}

export const exportToPDF = async (products: Product[]) => {
  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    let yPosition = margin

    // Encabezado
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0)
    doc.rect(0, 0, pageWidth, 18, "FD")
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("DEBANDI - Listado de Productos", pageWidth / 2, 12, { align: "center" })

    yPosition = 22

    // Fecha
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, margin, yPosition)
    
    yPosition += 8

    // Encabezados de tabla
    const columns = ["N°", "Producto", "Marca", "Categoría", "Stock", "Precio Original", "Precio Final"]
    const columnWidths = [8, 55, 25, 30, 15, 25, 25]

    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0)
    
    let xPos = margin
    columns.forEach((col, index) => {
      doc.text(col, xPos + 1, yPosition, { maxWidth: columnWidths[index] - 2 })
      xPos += columnWidths[index]
    })

    yPosition += 8

    // Filas de datos
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)

    products.forEach((product, index) => {
      // Salto de página si es necesario
      if (yPosition > pageHeight - margin - 5) {
        doc.addPage()
        
        // Repetir encabezado en nueva página
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(0, 0, 0)
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(255, 255, 255)
        doc.setLineWidth(0)
        
        let xHeaderPos = margin
        yPosition = margin
        columns.forEach((col, idx) => {
          doc.text(col, xHeaderPos + 1, yPosition, { maxWidth: columnWidths[idx] - 2 })
          xHeaderPos += columnWidths[idx]
        })
        
        yPosition += 8
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
      }

      xPos = margin
      
      // N°
      doc.text((index + 1).toString(), xPos + 1, yPosition)
      xPos += columnWidths[0]
      
      // Producto
      doc.text(product.name, xPos + 1, yPosition, { maxWidth: columnWidths[1] - 2 })
      xPos += columnWidths[1]
      
      // Marca
      doc.text(product.brand, xPos + 1, yPosition)
      xPos += columnWidths[2]
      
      // Categoría
      doc.text(product.category, xPos + 1, yPosition)
      xPos += columnWidths[3]
      
      // Stock
      const stockText = `${product.stock} un.`
      doc.text(stockText, xPos + 1, yPosition)
      xPos += columnWidths[4]
      
      // Precio Original
      const originalPrice = product.originalPrice 
        ? `$${product.originalPrice.toFixed(2)}` 
        : "-"
      doc.text(originalPrice, xPos + 1, yPosition)
      xPos += columnWidths[5]
      
      // Precio Final
      doc.text(`$${product.price.toFixed(2)}`, xPos + 1, yPosition)

      yPosition += 6
    })

    // Pie de página
    const pageCount = (doc as any).internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
      (doc as any).setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.setFont("helvetica", "normal")
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      )
    }

    doc.save("listado-productos-debandi.pdf")
  } catch (error) {
    console.error("Error exporting to PDF:", error)
    throw error
  }
}

export const exportToExcel = (products: Product[]) => {
  try {
    const workbook = XLSX.utils.book_new()

    const data = products.map((product) => ({
      ID: product.id,
      Nombre: product.name,
      Categoría: product.category,
      Marca: product.brand,
      Stock: product.stock,
      "Precio Original": product.originalPrice ? `$${product.originalPrice.toFixed(2)}` : "N/A",
      "Precio Final": `$${product.price.toFixed(2)}`,
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 8 },
      { wch: 40 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
    ]
    worksheet["!cols"] = columnWidths

    // Estilos para encabezados
    const headerStyle = {
      fill: { fgColor: { rgb: "8CCED9" } },
      font: { bold: true, color: { rgb: "000000" } },
      alignment: { horizontal: "center", vertical: "center" },
    }

    // Aplicar estilos a encabezados
    const headers = Object.keys(data[0])
    headers.forEach((header, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index })
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = headerStyle
      }
    })

    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos")

    XLSX.writeFile(workbook, "listado-productos-debandi.xlsx")
  } catch (error) {
    console.error("Error exporting to Excel:", error)
    throw error
  }
}
