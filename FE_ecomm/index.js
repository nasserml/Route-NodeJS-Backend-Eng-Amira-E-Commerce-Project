//Create baseURL for the server
const baseUrl='http://localhost:3000';

// Dipaly the data of the products
displayData();

// Initialize the Socket IO instance using the base URL
const clientIo=io(baseUrl);

$('.createProduct').click(async function(){

    // Get  a new product data from the fields in the form titland basepruice and stock
    const data={title:$('#title').val(),basePrice:$('#basePrice').val(),stock:$('#stock').val()};

    // call the endpoint to create product
    const response=await axios.post(`${baseUrl}/product/add-product-socketIO-test`,data);

    // Console log the response
    console.log(response)
});


clientIo.on('new-product',()=>{
    displayData();
})

// axios => get all products
/**
 * Async function to dsiplay data fetched from the API end point 
 */
async function displayData(){
    
    // USe axios to make asynchronous GET request to the API endpoint
    const response=await axios.get(`${baseUrl}/product/get-all-products-socketIO-test`)

    // Empty string to store the html to be display
    let cartoona=``;

    // Loop through the response data that is fetched
    for(const product of response.data.data){

        // Add html for each product to the String
        cartoona += `
        <div class="col-md-4 my-2">
        <div class="p-2 border border-success text-center" >
        <h3>${product.title}</h3>
        <p>${product.desc}</p>
        <h3>${product.appliedPrice}</h3>
        <p>${product.stock}</p>
        </div>
      </div>
      `

      // Display the html element with id row data
      document.getElementById('rowData').innerHTML=cartoona;
    }
}
