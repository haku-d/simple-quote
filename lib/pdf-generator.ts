import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { PDFQuotationData } from '@/types'

// Set fonts
if (typeof window === 'undefined') {
  pdfMake.vfs = pdfFonts.pdfMake.vfs
}

/**
 * Format currency value
 */
function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * Format date
 */
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Generate PDF for a quotation
 */
export function generateQuotationPDF(data: PDFQuotationData): Promise<Blob> {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Your Company'
  const companyAddress = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '123 Main St, City, Country'
  const companyPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE || '+1 234 567 8900'
  const companyEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@company.com'

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      // Header
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: companyName, style: 'companyName' },
              { text: companyAddress, style: 'companyInfo' },
              { text: `Phone: ${companyPhone}`, style: 'companyInfo' },
              { text: `Email: ${companyEmail}`, style: 'companyInfo' },
            ],
          },
          {
            width: 'auto',
            text: 'LOGO',
            style: 'logo',
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Quote info
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: `QUOTE #: ${data.number}`, style: 'header' },
              { text: `Date: ${formatDate(data.date)}`, style: 'infoText' },
              { text: `Valid until: ${formatDate(data.expiryDate)}`, style: 'infoText' },
            ],
          },
          {
            width: '*',
            stack: [
              { text: 'Bill To:', style: 'sectionHeader' },
              { text: data.customerName, bold: true },
              data.customerCompany ? { text: data.customerCompany } : {},
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Greeting
      { text: `Dear ${data.customerName},`, margin: [0, 0, 0, 20] },

      // Separator
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 0, 0, 10] },

      // Products header
      { text: 'PRODUCT DETAILS', style: 'sectionHeader', margin: [0, 0, 0, 10] },

      // Items
      ...data.items.flatMap(item => [
        { text: item.productName, style: 'productName', margin: [0, 5, 0, 5] },
        {
          ul: item.selectedOptions.map(opt => opt),
          margin: [20, 0, 0, 5],
        },
        {
          text: `${item.orderQty} units × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.lineTotal)}`,
          margin: [0, 0, 0, 10],
        },
      ]),

      // Separator
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 10, 0, 10] },

      // Totals
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 200,
            stack: [
              {
                columns: [
                  { text: 'Subtotal:', width: '*' },
                  { text: formatCurrency(data.subtotal), width: 'auto', alignment: 'right' },
                ],
                margin: [0, 2, 0, 2],
              },
              data.discount ? {
                columns: [
                  {
                    text: `Discount (${data.discount.type === 'percent' ? `${data.discount.value}%` : 'Fixed'}${data.discount.reason ? ` - ${data.discount.reason}` : ''}):`,
                    width: '*'
                  },
                  { text: `-${formatCurrency(data.discount.amount)}`, width: 'auto', alignment: 'right' },
                ],
                margin: [0, 2, 0, 2],
              } : {},
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }], margin: [0, 5, 0, 5] },
              {
                columns: [
                  { text: 'Amount after discount:', width: '*' },
                  { text: formatCurrency(data.subtotal - (data.discount?.amount || 0)), width: 'auto', alignment: 'right' },
                ],
                margin: [0, 2, 0, 2],
              },
              {
                columns: [
                  { text: `VAT (${data.taxRate}%):`, width: '*' },
                  { text: formatCurrency(data.tax), width: 'auto', alignment: 'right' },
                ],
                margin: [0, 2, 0, 2],
              },
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }], margin: [0, 5, 0, 5] },
              {
                columns: [
                  { text: 'GRAND TOTAL:', width: '*', bold: true, fontSize: 12 },
                  { text: formatCurrency(data.grandTotal), width: 'auto', alignment: 'right', bold: true, fontSize: 12 },
                ],
                margin: [0, 2, 0, 2],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Note
      data.note ? {
        stack: [
          { text: 'Note:', style: 'sectionHeader', margin: [0, 10, 0, 5] },
          { text: data.note, margin: [0, 0, 0, 10] },
        ],
      } : {},

      // Policy
      data.policy ? {
        stack: [
          { text: 'Terms & Conditions:', style: 'sectionHeader', margin: [0, 10, 0, 5] },
          { text: data.policy, margin: [0, 0, 0, 20] },
        ],
      } : {},

      // Signature
      {
        stack: [
          { text: 'Best regards,', margin: [0, 20, 0, 10] },
          { text: '[Signature]', margin: [0, 0, 0, 30] },
          { text: data.salesName, bold: true },
          { text: 'Sales Manager' },
        ],
      },
    ],

    styles: {
      companyName: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 5],
      },
      companyInfo: {
        fontSize: 9,
        margin: [0, 2, 0, 0],
      },
      logo: {
        fontSize: 16,
        bold: true,
        alignment: 'right',
        margin: [0, 0, 0, 0],
      },
      header: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 5],
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      infoText: {
        fontSize: 10,
        margin: [0, 2, 0, 0],
      },
      productName: {
        fontSize: 11,
        bold: true,
      },
    },

    defaultStyle: {
      fontSize: 10,
    },
  }

  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition)
      pdfDocGenerator.getBlob((blob) => {
        resolve(blob)
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Download PDF
 */
export function downloadPDF(data: PDFQuotationData, filename?: string) {
  const pdfDocGenerator = pdfMake.createPdf(generatePDFDefinition(data))
  pdfDocGenerator.download(filename || `Quote-${data.number}.pdf`)
}

/**
 * Get PDF definition (helper for server-side)
 */
function generatePDFDefinition(data: PDFQuotationData): TDocumentDefinitions {
  // Reuse the logic from generateQuotationPDF
  return {} as TDocumentDefinitions // Placeholder - use same logic as above
}
