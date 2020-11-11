var Sinflar = require('./schemes').Sinflar;

module.exports = {
    //yaratish
    create: function (sinflar) {
        return new Sinflar(sinflar).save();
    },
    //barchasini olish
    getAll: function (categoryName) {
        return Sinflar.find({
            categoryName: categoryName
        }).sort({
            name: 1
        });
    },
    //bitta sinfni nomi bilan olish
    getOne: function (name, categoryName) {
        return Sinflar.findOne({
            name: name,
            categoryName: categoryName
        });
    },
    //Berilgan fandagi Sinflar soni
    getCountCategory: function (category) {
        return Sinflar.find({
            categoryName: category
        }).count();
    },
    //Test nomini o'zgartirish
    changeName: function (oldername, name) {
        return Sinflar.updateOne({
            name: oldername
        }, {
            $set: {
                name: name
            }
        });
    },

    deleteByName: (name, categoryName) => {
        return Sinflar.deleteOne({
            name: name,
            categoryName: categoryName
        })
    }


}