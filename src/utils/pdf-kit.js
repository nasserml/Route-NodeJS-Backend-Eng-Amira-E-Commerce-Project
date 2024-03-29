import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';

/**
 * Creates an invoice PDF with the provided data and save it in the specified path.
 * 
 * @param {object} invoice - The invoice data to be included in the PDF.
 * @param {string} pathVar - The path variable specifying where to save the generated PDF.
 */
function createInvoice(invoice, pathVar) {

    // Create a new pdf documentr with A4 size and 50px margin
    let doc = new PDFDocument({size:'A4',margin:50});

    // Generate the header pf the pdf document.
    generateHeader(doc);

    // Generate the customer information section of the pdf document
    generateCustomerInformation(doc,invoice);

    // Generate the table of products included in the invoice
    generateInvoiceTable(doc,invoice);

    // Generate the footer of the pfd document
    generateFooter(doc);

    // End the pdf document close the stream
    doc.end();

    // Pipe the pdf document to a write stream for specified path
    doc.pipe(fs.createWriteStream(path.resolve(`./Files/${pathVar}`)));
}

/**
 * Generates a header for a given document.
 * 
 * @param {PDFDocument} doc - The document to gebnerate the header for.
 */
function generateHeader(doc) {

    doc
        .image('invoice-logo.jpg',50,45,{width:50}) // Set invoice logo image at 50px x 45px position with 50px width
        .fillColor('#444444') // Set the text color to dark gray
        .fontSize(20) // Set the font size to 20
        .text('Route',110,57) // Write the company name 'Route' to the top center of the document
        .fillColor('#09c') // Set the text color to blue
        .fontSize(10) // Set the text font size to 10
        .text('Route',200,50,{align:'right'}) // Writ ethe company name 'Route' to the top  left corner of the document with the text algined to the right
        .text('6 tahrir street',200,65,{align:'right'}) // Write the company address to the top left corner odf the document with text aligned to ythe right
        .text('Cairo,Egypt',200,80,{align:'right'}) //write the company address to the top left corner of the document with text aligned to right
        .moveDown(); // Start a new line.
}

/**
 * Generate customer information in the invoice document
 * 
 * @param {PDFDocument} doc -  The pdf document to which the information is being added/
 * @param {object} invoice - The invoice object containing order information.
 */
function generateCustomerInformation(doc,invoice){


    // Set the fill color to light gray and font size to 20 
    doc.fillColor('#444444').fontSize(20).text('Invoice',50,160);

    // Generate hirozontal line at y-coordinate 185
    generateHr(doc,185);

    // Set the top position for the customer information t0 200
    const customerInformationTop=200;

    // Add customer information to the document
    doc
        .fontSize(10) // Set the font size to 10
        .text('Order Code:',50,customerInformationTop) // Add order code : text at (50,200)
        .font('Helvetica-Bold') // Set the font to 'Helvetica-Bold
        .text(invoice.orderCode,150,customerInformationTop) // Add order code value at (150,200)
        .font('Helvetica') // Set font to 'Helvetica'
        .text('Invoice Data:',50,customerInformationTop+30) // Add Invoice dataL text at (50,230)
        .text(formatDate(new Date(invoice.date)),150,customerInformationTop+30) // Add formatted date value at (150,230)
        .font('Helvetica-Bold') // Set font to 'Helvetica-Bold
        .text(invoice.shipping.name,300,customerInformationTop) // Add shipping name value at (300,200)
        .font('Helvetica') // Set font to 'Helvetica
        .text(invoice.shipping.address,300,customerInformationTop+15) // Add shipping address value at (300,215)
        .text(invoice.shipping.city+', '+invoice.shipping.state+', '+invoice.shipping.country,300,customerInformationTop+30) // Add shiiping city, state, country values at (300,215) 
        .moveDown(); // Move the cursor down

    // Generate horizontal ione at y-coordinate 252
    generateHr(doc,252); 

}

/**
 * Generate the invoice table in the invoice document pdf 
 * 
 * @param {PDFDocument} doc - The invoice pdf document to generate the table in.
 * @param {object} invoice - The invoice object containing the data for the table.
 */
function generateInvoiceTable(doc,invoice){
    // Initialize variable i
    let i;

    // Initialize the tiop position of the invoice table
    const invoiceTableTop=330;

    // Set the font style to Helvetica-Bold
    doc.font('Helvetica-Bold');

    // Generate the header row of the table 
    generateTableRow(doc,invoiceTableTop,'Item','Unit Cost','Quantity','Line Total');
    
    // Generate a horizontal line below the header row
    generateHr(doc,invoiceTableTop+20);

    // Set the fiont style in the document to Helvetica
    doc.font('Helvetica')

    // Loop through eact item in the invoice to generate a table row for each item
    for(i=0;i<invoice.items.length;i++){

        // Get the current item
        const item=invoice.items[i];

        // Calculate the position of the row based on the current item index
        const position=invoiceTableTop+(i+1)*30;
        
        // generate table row for the cuurent item
        generateTableRow(doc,position,item.title,formatCurrency(item.price),item.quantity,formatCurrency(item.price*item.quantity));

        // Generate a horizontal line below the table row
        generateHr(doc,position+20);
    }

    // Calculate the position of the subtiotal row
    const subTotalPosition=invoiceTableTop+(i+1)*30;

    // Generate the table row for the subtotal
    generateTableRow(doc,subTotalPosition,'','','Subtotlal','',formatCurrency(invoice.subTotal));

    // Calculate the position of the paiod amount row
    const paidAmountPosition=subTotalPosition+20;

    // Generate table row for the paid amount
    generateTableRow(doc,paidAmountPosition,'','','Paid Amount','',formatCurrency(invoice.paidAmount));

    // Set the font stly of the document back to Helvtica
    doc.font('Helvetica');

}

/**
 * Generates a table row in a document. 
 * 
 * @param {PDFDocument} doc - The pdf document to add the table row to 
 * @param {number} y - the y-coordinate  for the table row to
 * @param {string} item - The item name
 * @param {string} description - The item description
 * @param {number} unitCost - The cost per unit
 * @param {number} quantity - The quantity of otems
 * @param {number} lineTotal - The total cost for the line
 */
function generateTableRow(doc,y,item,description,unitCost,quantity,lineTotal){
    doc
        .fontSize(10) // Set the font size to 10 
        .text(item,50,y) // Add item name at (50,y)
        .text(description,150,y) // Add item description at (150,y)
        .text(unitCost,280,y,{width:90,align:'right'}) // Add unit coost with width of 90 and alignmet right at (370,y)
        .text(quantity,370,y,{width:90,align:'right'}) // Add quantity with the width of 90 and alignment righ at (370,y)
        .text(lineTotal,0,y,{align:'right'}) // Add lineTotal with alignment right at (0,y)
}

/**
 * Generates a footer for the document.
 * 
 * @param {PDFDocument} doc - The pdf document to add the footer to
 */
function generateFooter(doc){

    // Set the font size to 10, and write text to the center bottom of the page with width of 500 pixels and add align the text to the center
    doc.fontSize(10).text('Payment is due within 15 days. Thanks you for your businees.',50,780,{align:'center',width:500});
}

/**
 * Generate a horizontal line on the given document at specified y-coordinate.
 * 
 * @param {PDFDocument} doc - The document to draw the horizontal line on.
 * @param {number} y - The y-coordinate for the horizontal line 
 */
function generateHr(doc,y){
    // Set the line color to the light gray with line width equal 1 pixel and move to the star of the line and draw a line from the current position to (550,y) which is the end of the line then stroke the line draw it on the doccument
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50,y).lineTo(550,y).stroke()
}
/**
 * Formats teh given amount of cents into a currency string,
 * 
 * @param {number} cents - The amoumt of cents to format
 * @returns {string} The formatted currency string
 */
function formatCurrency(cents){
    
    // Concatenate the cents value and string 'EGP' to form a cuurnecy string and return it
     return cents+'EGP';
}

/**
 * Fucntion to format a given date into a specific string format.
 * @param {Date} date - The date to format.
 * @returns {string} The formated date String
 */
function formatDate(date){
    
    // Get the day, month and year from the date
    const day=date.getDate();

    // getMonth() returns a zero based index hence we add 1 to get the actyual month number
    const month=date.getMonth()+1;

    // getFullYear() returns the year as number
    const year=date.getFullYear();

    // Return the formatted date string in format as year/month/day
    return year+'/'+month+'/'+day;
}

export default createInvoice;