import { PDFDocument, PDFName, PDFString } from "pdf-lib";

const XMP_TEMPLATE = (title: string, now: string) => `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmp="http://ns.adobe.com/xap/1.0/"
      xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
      xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <dc:format>application/pdf</dc:format>
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(title)}</rdf:li></rdf:Alt></dc:title>
      <xmp:CreateDate>${now}</xmp:CreateDate>
      <xmp:ModifyDate>${now}</xmp:ModifyDate>
      <pdf:Producer>Convertitore PA</pdf:Producer>
      <pdfaid:part>2</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function applyPdfAMetadata(pdf: PDFDocument, title: string): Promise<void> {
  const now = new Date();
  pdf.setTitle(title);
  pdf.setProducer("Convertitore PA");
  pdf.setCreator("Convertitore PDF per la Burocrazia Italiana");
  pdf.setCreationDate(now);
  pdf.setModificationDate(now);
  pdf.setLanguage("it-IT");

  const iso = now.toISOString();
  const metadata = pdf.context.stream(XMP_TEMPLATE(title, iso), {
    Type: "Metadata",
    Subtype: "XML",
  });
  pdf.catalog.set(PDFName.of("Metadata"), metadata);

  const markInfo = pdf.context.obj({ Marked: true });
  pdf.catalog.set(PDFName.of("MarkInfo"), markInfo);
  pdf.catalog.set(PDFName.of("GTS_PDFA1"), PDFString.of("PDF/A-2B"));
}

export async function savePdf(pdf: PDFDocument): Promise<Uint8Array> {
  return pdf.save({ useObjectStreams: true });
}
