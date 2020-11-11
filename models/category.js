var Category = require('./schemes').Category;

module.exports = {
    //yaratish
    create: function (category) {
        return new Category(category).save();
    },
    getAll: function () {
        return Category.find().sort({
            name: -1
        });

    },
    getOne: function (name) {
        return Category.findOne({
            name: name
        });
    },
    getCount: function () {
        return Category.find().count();
    },
    changeName: function (oldername, name) {
        return Category.update({
            name: oldername
        }, {
            $set: {
                name: name
            }
        });
    },
    deleteByName: (name) => {
        return Category.deleteOne({
            name: name
        })
    }


}