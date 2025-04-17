const mongoose = require('mongoose');

const slugify = require('slugify');


const ProductSchema = new mongoose.Schema({
    STT: {
        type: Number,
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    slug: { 
        type: String, 
        slug: "name",
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price must be a positive number']
    },
    slugCategory: { 
        type: String, 
        slug: "category",
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    stock: { type: Number, default: 0 },
    imageUrl: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 3
    },
    deleted: { 
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

ProductSchema.pre('save', function(next) {
    if (this.isModified('name') || this.isNew) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    if (this.isModified('category') || this.isNew) {
        this.slugCategory = slugify(this.category, { lower: true, strict: true });
    }
    next();
});


const Product = mongoose.model('Product', ProductSchema , "product");

module.exports = Product;
