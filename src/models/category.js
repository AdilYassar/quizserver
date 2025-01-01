import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    isQuizCategory: { type: Boolean, required: true } // Add this field
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
