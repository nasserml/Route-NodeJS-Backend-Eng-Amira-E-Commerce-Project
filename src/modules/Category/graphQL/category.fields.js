
import {GraphQLList} from 'graphql';
import {getCategoriesResolve,getCategoryResolve, updateCategoryResolve} from './category.resolve.js';
import {categoryType} from './category.types.js';
import {getCategoryArgs, updateCategoryArgs} from './category.args.js';


export const getCategory={
    name:'GetCategory',
    description:'get one category',
    args:getCategoryArgs,
    type:categoryType,
    resolve:getCategoryResolve(),
}

export const getAllCategories={
    name:'AllCategories',
    description:'get all categories',
    type:new GraphQLList(categoryType),
    resolve:getCategoriesResolve()
}

export const updateCategory={
    name:'UpdateCategory',
    description:'update one category',
    args:updateCategoryArgs,
    type:categoryType,
    resolve:updateCategoryResolve(),
}