const mongoose = require('mongoose')

const testlar = new mongoose.Schema({
    testId: {
        type: String,
        unique: true
    },
    mavzuId:String,
    testFileId:String,
    testCount:Number,
    testKey: {
        type: String,
        default: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    }
})

const Testlar = mongoose.model("Testlar", testlar)
const sinflar = new mongoose.Schema({
    name: {
        type: String,
        min: 1,
        max: 100
    },
    categoryName: String
})

const Sinflar = mongoose.model("sinflar", sinflar)
const mavzular = new mongoose.Schema({
    name: {
        type: String,
        min: 1,
        max: 255,
        unique: false
    },
    sinfnomi: String,
    categoryName: String
})
const Mavzular = mongoose.model("mavzular", mavzular)
const Category = mongoose.model('category', new mongoose.Schema({
    name: {
        type: String,
        unique: true
    }
}));
const Files = mongoose.model('files', new mongoose.Schema ({
    fileId: String,
    mavzuId:mongoose.Schema.Types.ObjectId,
    about:{type:String,
    maxlength:996},
    file_turi:{type:String,maxlength:18}//Masalan slayd
}))
module.exports = {
    Testlar,
    Sinflar,
    Mavzular,
    Category,
    Files
}