import {GraphQLObjectType,GraphQLString,GraphQLID} from 'graphql';

/**
 * Create a new GraphQLObjectType for an image
 * @param {String} name - The name of the image.
 * @returns {GraphQLObjectType} The new GraphQLObjectType for the image.
 */
const image=(name)=>{
    return new GraphQLObjectType({
        name:name||'image',
        description:'category image',
        fields:{secure_url:{type:GraphQLString},public_id:{type:GraphQLID}},
    });
};


export const categoryType=new GraphQLObjectType({
    name:'category',
    description:'object of category',
    fields:{
        name:{type:GraphQLString},
        slug:{type:GraphQLString},
        addedBy:{type:GraphQLID},
        updatedBy:{type:GraphQLID},
        Image:{type:image('categoryimage')}
    },
});