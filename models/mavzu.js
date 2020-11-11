var Mavzular = require('./schemes').Mavzular;

module.exports = {
    //yaratish
    create: function (mavzular) {
        return new Mavzular(mavzular).save();
    },
    //barchasini olish
    getAll: function (sinfNomi, categoryName) {
        return Mavzular.find({
            sinfnomi: sinfNomi,
            categoryName: categoryName
        }).sort({
            name: -1
        });

    },
    //bitta sinfni nomi bilan olish
    getOne: function (name, sinfNomi, categoryName) {
        return Mavzular.findOne({
            name: name,
            categoryName: categoryName,
            sinfnomi: sinfNomi
        });
    },
    getById: function (_id) {
        return Mavzular.findById(_id);
    },
    //Test nomini o'zgartirish
    changeName: function (sinfNomi, categoryName, oldername, newName) {
        return Mavzular.updateOne({
            name: oldername,
            sinfNomi: sinfNomi,
            categoryName: categoryName
        }, {
            $set: {
                name: newName
            }
        });
    },

    deleteByName: (name, categoryName, sinfNomi) => {
        return Mavzular.deleteOne({
            sinfnomi: sinfNomi,
            categoryName: categoryName,
            name: name
        })
    }


}