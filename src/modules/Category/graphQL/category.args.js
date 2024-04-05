import {GraphQLID, GraphQLString} from 'graphql';

export const getCategoryArgs={
    name:{type:GraphQLString}
}

export const updateCategoryArgs={
    name:{type:GraphQLString},
    id:{type:GraphQLID}
}