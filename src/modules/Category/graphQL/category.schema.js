import {GraphQLSchema,GraphQLObjectType} from 'graphql';
import { getAllCategories, getCategory, updateCategory } from './category.fields.js';

const categorySchema=new GraphQLSchema({
    query:new GraphQLObjectType({
        name:'categoorySchema',
        description:'Category Schema',
        fields:{
            // get category
            getCategory:getCategory,
            getAllCategories:getAllCategories
        }
    }),
    mutation:new GraphQLObjectType({
        name:'categoryMutationSchema',
        description:'Category mutation schema',
        fields:{
            updateCategory:updateCategory
        }
    })
})

export default categorySchema;