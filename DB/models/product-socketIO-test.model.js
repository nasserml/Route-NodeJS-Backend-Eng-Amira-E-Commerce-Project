import mongoose,{Schema,model} from 'mongoose';

const productSocketIOTestSchema=new Schema({
    title:{type:String,required:true,trim:true},
    desc:String,
    basePrice:{type:Number,required:true},
    stock:{type:Number,required:true, min:1},
},{timestamps:true});

export default mongoose.models.ProductSocketIOTest||model('ProductSocketIOTest',productSocketIOTestSchema);