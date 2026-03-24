import express from "express";
import { create } from "xmlbuilder2";
import db from "../db.ts";
import { authenticate, authorize } from "../utils/authMiddleware.ts";

const router = express.Router();

router.use(authenticate);

router.get("/export", authorize(['admin', 'superadmin', 'accountant']), (req, res) => {
  const { year, month } = req.query;
  const school = (req as any).school;

  if (!school) return res.status(400).json({ error: "Contexto de escola necessário" });
  if (!year || !month) return res.status(400).json({ error: "Ano e mês são obrigatórios" });

  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`; // Simplified

    const invoices = db.prepare(`
      SELECT i.*, u.name as student_name, u.email as student_email, s.registration_number
      FROM invoices i
      JOIN students s ON i.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE i.school_id = ? AND i.invoice_date BETWEEN ? AND ?
    `).all(school.id, startDate, endDate) as any[];

    const products = db.prepare("SELECT * FROM products WHERE school_id = ?").all(school.id) as any[];
    const customers = db.prepare(`
      SELECT DISTINCT u.id, u.name, u.email, s.registration_number, s.guardian_name
      FROM users u
      JOIN students s ON u.id = s.user_id
      JOIN invoices i ON s.id = i.student_id
      WHERE i.school_id = ? AND i.invoice_date BETWEEN ? AND ?
    `).all(school.id, startDate, endDate) as any[];

    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('AuditFile', { xmlns: 'urn:OECD:StandardAuditFile-Tax:AO:1.01_01' });

    const header = root.ele('Header');
    header.ele('AuditFileVersion').txt('1.01_01').up()
      .ele('CompanyID').txt(String(school.id)).up()
      .ele('TaxRegistrationNumber').txt('500000000').up()
      .ele('TaxAccountingBasis').txt('F').up()
      .ele('CompanyName').txt(school.name).up()
      .ele('BusinessName').txt(school.name).up()
      .ele('CompanyAddress')
        .ele('AddressDetail').txt(school.address || 'Luanda, Angola').up()
        .ele('City').txt('Luanda').up()
        .ele('Country').txt('AO').up()
      .up()
      .ele('FiscalYear').txt(String(year)).up()
      .ele('StartDate').txt(startDate).up()
      .ele('EndDate').txt(endDate).up()
      .ele('CurrencyCode').txt('AOA').up()
      .ele('DateCreated').txt(new Date().toISOString().split('T')[0]).up()
      .ele('TaxEntity').txt('Global').up()
      .ele('ProductCompanyID').txt('Kulonga Platform').up()
      .ele('ProductID').txt('Kulonga/v1').up()
      .ele('SchoolID').txt(String(school.id)).up();

    const masterFiles = root.ele('MasterFiles');
    
    customers.forEach((customer: any) => {
      masterFiles.ele('Customer')
        .ele('CustomerID').txt(String(customer.id)).up()
        .ele('AccountID').txt('Desconhecido').up()
        .ele('CustomerTaxID').txt('999999999').up()
        .ele('CompanyName').txt(customer.name).up()
        .ele('BillingAddress')
          .ele('AddressDetail').txt('Luanda').up()
          .ele('City').txt('Luanda').up()
          .ele('Country').txt('AO').up()
        .up()
        .ele('SelfBillingIndicator').txt('0').up()
      .up();
    });

    products.forEach((product: any) => {
      masterFiles.ele('Product')
        .ele('ProductType').txt('S').up()
        .ele('ProductCode').txt(String(product.id)).up()
        .ele('ProductDescription').txt(product.name).up()
        .ele('ProductNumberCode').txt(String(product.id)).up()
      .up();
    });

    masterFiles.ele('TaxTable')
      .ele('TaxTableEntry')
        .ele('TaxType').txt('IVA').up()
        .ele('TaxCountryRegion').txt('AO').up()
        .ele('TaxCode').txt('NOR').up()
        .ele('Description').txt('Taxa Normal').up()
        .ele('TaxPercentage').txt('14.00').up()
      .up();

    const sourceDocs = root.ele('SourceDocuments');
    const salesInvoices = sourceDocs.ele('SalesInvoices');
    salesInvoices.ele('NumberOfEntries').txt(String(invoices.length)).up()
      .ele('TotalDebit').txt('0.00').up()
      .ele('TotalCredit').txt(invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)).up();

    invoices.forEach((inv: any) => {
      const items = db.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?").all(inv.id) as any[];
      const invoice = salesInvoices.ele('Invoice');
      invoice.ele('InvoiceNo').txt(inv.invoice_no || `FT ${year}/${inv.id}`).up()
        .ele('DocumentStatus')
          .ele('InvoiceStatus').txt('N').up()
          .ele('InvoiceStatusDate').txt(inv.invoice_date || inv.due_date).up()
          .ele('SourceID').txt('1').up()
          .ele('SourceBilling').txt('P').up()
        .up()
        .ele('Hash').txt(inv.hash || '0').up()
        .ele('HashControl').txt('1').up()
        .ele('Period').txt(String(month)).up()
        .ele('InvoiceDate').txt(inv.invoice_date || inv.due_date).up()
        .ele('InvoiceType').txt('FT').up()
        .ele('SelfBillingIndicator').txt('0').up()
        .ele('SystemEntryDate').txt(new Date().toISOString().replace('Z', '')).up()
        .ele('CustomerID').txt(String(inv.student_id)).up();

      items.forEach((item: any) => {
        invoice.ele('Line')
          .ele('LineNumber').txt('1').up()
          .ele('ProductCode').txt(String(item.product_id)).up()
          .ele('ProductDescription').txt(item.description).up()
          .ele('Quantity').txt(String(item.quantity)).up()
          .ele('UnitOfMeasure').txt('Un').up()
          .ele('UnitPrice').txt(item.unit_price.toFixed(2)).up()
          .ele('TaxPointDate').txt(inv.invoice_date || inv.due_date).up()
          .ele('Description').txt(item.description).up()
          .ele('CreditAmount').txt(item.total_amount.toFixed(2)).up()
          .ele('Tax')
            .ele('TaxType').txt('IVA').up()
            .ele('TaxCountryRegion').txt('AO').up()
            .ele('TaxCode').txt('NOR').up()
            .ele('TaxPercentage').txt(item.tax_rate.toFixed(2)).up()
          .up()
          .ele('SettlementAmount').txt('0.00').up()
        .up();
      });

      invoice.ele('DocumentTotals')
        .ele('TaxPayable').txt(inv.total_tax.toFixed(2)).up()
        .ele('NetTotal').txt(inv.net_total.toFixed(2)).up()
        .ele('GrossTotal').txt(inv.amount.toFixed(2)).up()
      .up();
    });

    const xml = root.end({ prettyPrint: true });
    res.header('Content-Type', 'application/xml');
    res.attachment(`SAFT_AO_${school.subdomain}_${year}_${month}.xml`);
    res.send(xml);

    // Record export
    db.prepare("INSERT INTO saft_exports (school_id, year, month, file_name) VALUES (?, ?, ?, ?)")
      .run(school.id, year, month, `SAFT_AO_${school.subdomain}_${year}_${month}.xml`);

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar SAF-T: " + err.message });
  }
});

export default router;
