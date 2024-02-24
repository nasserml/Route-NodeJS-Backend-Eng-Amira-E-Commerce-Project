import slugify from 'slugify';

import Category from '../../../DB/models/category.model.js';
import SubCategory from '../../../DB/models/sub-category.model.js';
import Brand from '../../../DB/models/brand.model.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import generateUniqueString from '../../utils/.js';