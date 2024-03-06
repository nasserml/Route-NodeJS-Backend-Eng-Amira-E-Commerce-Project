import qrcode from 'qrcode';

/**
 * @description Generate a QR code image from the data 
 * 
 * @param {Object} data - The data object to be encoded in the QR code
 * @returns {string} The generated QR code image in a data URL.
 */
export const qrCodeGeneration = async (data)=>{
    
    // 1- Generate the QR code image from the data
    const generatedQrCode =  await qrcode.toDataURL(JSON.stringify(data),{errorCorrectionLevel:'H'});

    // 2- Return the generated QR code image
    return generatedQrCode;
}