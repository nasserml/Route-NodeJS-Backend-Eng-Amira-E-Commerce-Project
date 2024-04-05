import categoryModel from '../../../../DB/models/category.model.js';

/**
 * A resolve function that returns an async function to find category by name
 * 
 * @param {Object} parent - The parent object.
 * @param {Object} args - The arguments object with a name property.
 * 
 * @returns {Object} The category found by name.
 */
export const getCategoryResolve=()=>{

    // Return a function that will find category by name
    return async (parent,args)=>{

        // Find category by name 
        const category=await categoryModel.findOne({name:args.name});

        // Return the category
        return category;
    }
}

/**
 * A resolve function that will return async function the all categories from the database.
 * 
 * @returns {Array<Object>} The all categories foun in the database
 */
export const getCategoriesResolve=()=>{

    // Return a function that will find all categories
    return async ()=>{

        // Find all categories
        const categories=await categoryModel.find();

        // Return all categories
        return categories;
    }
}


/**
 * A resolve function that will return an async function that will fin category by id and updates its anme base on the name in the args.
 * 
 * @param {Object} parent - The parent object
 * @param {Object} args - The arguments object with an id and the new name to be updated
 * 
 * @returns {Object} The updated category
 */
export const updateCategoryResolve=()=>{

    // Return a function that will find category by id and update its name
    return async(parent,args)=>{

        // Find category by id and update its name 
        const category=await categoryModel.findByIdAndUpdate(args.id,{name:args.name},{new:true});

        // Return the updated category
        return category
    }
}