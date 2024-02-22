import { paginationFunction } from "./pagination.js";


export class APIFeatures {

    // mongooseQuery = model.find()
    // query = req. query
    constructor(query, mongooseQuery){
        this.query = query;
        this.mongooseQuery = mongooseQuery;
    }
    /**
     * Aplly pagination to the query based on the provided page number and size.
     * 
     * @param {Object} options - The pagination options.
     * @param {number} options.page - The page number.
     * @param {number} options.size - The page size.
     * @returns  {Object} - Return the mmopdified mongoose query object.
     */
    pagination({page, size}) {
        
        // Extracts the limitand the skip based on the provided page and sioze.
        const { limit, skip } = paginationFunction({page, size});

        //  Modifies the mongooseQuery to apply pagination by limiting the number of items retrieved and skiping certain items.
        this.mongooseQuery = this.mongooseQuery.limit(limit).skip(skip);

        // Return the modified query obect.
        return this
    }

    /**
     * Sort the query by a specified field and order.
     * @param {string} sortBy - The field and order to sort by.
     * @returns {Object} - The modifioed query object
     */
    sort(sortBy) {

        // If sortBy isnot provided , sort by createdAt in descending order.
        if (!sortBy) {
            
            // Sort by createdAt in descending order
            this.mongooseQuery = this.mongooseQuery.sort({ createdAt: -1});
            
            // Return the modified query object
            return this;
        
        }
        
        // Parse the sortBy string to extract the field and order
        const formula = sortBy.replace(/desc/g, -1).replace(/asc/g, 1).replace(/ /g, ':');

        const [key, value] = formula.split(':');

        // Apply the sorting based on the extracted field and order
        this.mongooseQuery = this.mongooseQuery.sort({ [key]: +value});

        // Return the modified query object
        return this
    }

    /**
     * Apply search filter based on the given search query
     * 
     * @param {Object} search - The search query.
     * @param {string} search.title - The title to search for
     * @param {string} search.desc - The description to search for
     * @param {number} search.discount - The discount to search for
     * @param {number} search.priceFrom - The minimun price to filter by
     * @param {number} search.priceTo - The maximum price to filter by
     * 
     * @returns {Object} - The modified mongooseQuery object.
     */
    search(search) {
        
        // Initialize the query filter
        const queryFilter = {};

        // Apply title search filter
        if (search.title) queryFilter.title = { $regex: search.title, $options: 'i'};

        // Apply description search filter
        if(search.desc) queryFilter.desc = { $regex: search.desc, $options: 'i'};

        // Apply discount to search filter
        if (search.discount) queryFilter.discount = { $ne: 0};

        // Apply price range to search filter
        if (search.priceFrom && !search.priceTo) queryFilter.appliedPrice = {$gte: search.priceFrom};
        if (search.priceTo && !search.priceFrom) queryFilter.appliedPrice = {$lte: search.priceTo};
        if(search.priceTo && search.priceFrom) queryFilter.appliedPrice = { $gte: search.priceFrom, $lte: search.priceTo };

        // Modifie the mongooseQuery with applied quety filter
        this.mongooseQuery = this.mongooseQuery.find(queryFilter);

        // Return the updated mongooseQuery Object
        return this;
    }
    

    /**
     * Apply filters to mongoose query
     * 
     * @param {Object} filters - The filters to apply
     * @returns  {Object} - The modified mongooseQuery object
     */
    filters(filters) {
        /**
         * The filters will contain data like this
         * @params will be in this formate
         * appliedPric[gte]=100
         * stock[lte]=100
         * discount[ne]=0
         * title[regex]=iphone
         */
        // Convert filters to mongoose query
        const queryFilter = JSON.parse(JSON.stringify(filters).replace(/gt|gte|lt|lte|in|nin|eq|ne|regex/g, (operator) => `$${operator}`));

        /**
         * @object will be like this after the replace method
         * { appliedPrice: { $gte: 100 }, stock: { $lte:200 }, discount  {$in: 0}, title: {$regex: 'iphone}}
         */
        // Apply the filters to the mongoose query
        this.mongooseQuery.find(queryFilter);

        // Return updated instance of the class
        return this
    }
}