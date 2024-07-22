import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Listing } from "@/types/listing";
import { formatPrice } from "./helperFunctions";

export const generatePDF = (
  listingData: Listing,
  name: string,
  email: string
) => {
  if (!listingData) return;

  const doc = new jsPDF();
  const invoiceNumber = `INV-${Math.floor(Math.random() * 1000000)}`; //generate a unique invoice number
  const date = new Date().toLocaleDateString();
  const balanceDue = formatPrice(listingData.sellingPrice);

  doc.setProperties({
    title: `Garage Listing Invoice for ${name}`,
    subject: "Invoice for Fire Truck Listing",
    author: "Garage Technologies, Inc.",
    keywords: "invoice, fire truck, sale",
    creator: "Garage Technologies, Inc.",
  });

  //header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Garage Technologies, Inc.", 10, 20);

  //add contact info under company name
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Website: https://www.withgarage.com", 10, 27);
  doc.text("Phone: 201-293-7164", 10, 34);
  doc.text("Address: New York, NY 10012, US", 10, 41);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginRight = 20; //margin from the right edge
  const textX = pageWidth - marginRight; //x-coordinate for text on the right side

  //invoice Information (top right)
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${invoiceNumber}`, textX, 20, { align: "right" });
  doc.text(`Date: ${date}`, textX, 27, { align: "right" });
  doc.text(`Balance Due: ${balanceDue}`, textX, 34, { align: "right" });
  doc.text(`Bill To: ${name}`, textX, 41, { align: "right" });
  doc.text(`Email: ${email}`, textX, 48, { align: "right" });

  //table for item and pricing
  const columns = ["Item", "Quantity", "Price"];
  const rows = [
    [listingData.listingTitle, "1", formatPrice(listingData.sellingPrice)],
  ];

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 58,
    styles: {
      fontSize: 12,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [255, 204, 153],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    foot: [
      [
        { content: "Subtotal", colSpan: 2 },
        formatPrice(listingData.sellingPrice),
      ],
      [{ content: "Tax", colSpan: 2 }, `$0.00`],
      [
        { content: "Total", colSpan: 2, styles: { fontStyle: "bold" } },
        formatPrice(listingData.sellingPrice),
      ],
    ],
    footStyles: {
      fillColor: [255, 204, 153],
      textColor: [0, 0, 0],
    },
  });

  //add "Full Item Details" centered text below the first table
  const fullDetailsTitle = "Full Item Details";
  const fullDetailsTitleX = pageWidth / 2;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(
    fullDetailsTitle,
    fullDetailsTitleX,
    (doc as any).autoTable.previous.finalY + 10,
    { align: "center" }
  );

  const detailsStartY = (doc as any).autoTable.previous.finalY + 20;

  //conditional fields
  const address = [
    listingData.addressPrimary.trim(),
    listingData.addressCity !== "NA" ? listingData.addressCity.trim() : "",
    listingData.addressState !== "NA" ? listingData.addressState.trim() : "",
    listingData.addressZip !== "00000" ? listingData.addressZip.trim() : "",
  ]
    .filter((part) => part) // Remove empty parts
    .join(", ");
  const weight = listingData.itemWeight
    ? `${listingData.itemWeight} lbs`
    : "unknown";

  const detailsData = [
    ["Item", listingData.listingTitle],
    ["Quantity", "1"],
    ["Price", `$${listingData.sellingPrice.toFixed(2)}`],
    ["Brand", listingData.itemBrand],
    ["Description", listingData.listingDescription],
    ["Shippable", listingData.isShippable ? "Yes" : "No"],
    ["Weight", weight],
    ["Location", address],
  ];

  autoTable(doc, {
    body: detailsData,
    startY: detailsStartY,
    styles: {
      fontSize: 12,
      cellPadding: 4,
    },
  });

  //add images after the full item details table
  let imagesStartY = (doc as any).autoTable.previous.finalY + 20;

  //check if the images section fits on the current page
  if (imagesStartY > pageHeight - 40) {
    doc.addPage();
    imagesStartY = 20; //reset startY for new page
  }

  if (listingData.imageUrls && listingData.imageUrls.length > 0) {
    const itemPhotosTitle = "Item Photos";
    const itemPhotosTitleX = pageWidth / 2;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(itemPhotosTitle, itemPhotosTitleX, imagesStartY, {
      align: "center",
    });

    const margin = 10; //margin between images
    const imgWidth = 60;
    const imgHeight = 50;
    const imagesToShow = listingData.imageUrls.slice(0, 3); //show up to 3 images

    //calculate the total width of the images and margins
    const totalWidth = imgWidth * 3 + margin * 2;
    const startX = (pageWidth - totalWidth) / 2;

    imagesStartY += 10; //adjust for spacing between title and images

    imagesToShow.forEach((url, index) => {
      const image = new Image();
      image.src = url;
      image.onload = () => {
        const xPos = startX + index * (imgWidth + margin); //adjust xPos to center images
        const yPos = imagesStartY; //adjust yPos to place all images in a single row

        //check if yPos + imgHeight exceeds the page height
        if (yPos + imgHeight > pageHeight - 20) {
          doc.addPage();
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(itemPhotosTitle, itemPhotosTitleX, 20, {
            align: "center",
          });
          imagesStartY = 30; //reset startY for new page
        }

        doc.addImage(
          image,
          "JPEG",
          xPos,
          yPos,
          imgWidth,
          imgHeight,
          undefined,
          "FAST",
          0.6
        );

        if (index === imagesToShow.length - 1) {
          doc.save(`GarageInvoice-${name}.pdf`);
        }
      };
    });
  } else {
    doc.save(`GarageInvoice-${name}.pdf`);
  }
};
