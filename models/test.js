var Testlar = require('./schemes').Testlar;

module.exports = {
    //yaratish
    create: function (testlar) {
        return new Testlar(testlar).save();
    },
    //barchasini olish
    getByMavzu: function (mavzuId) {
        return Testlar.find({
            mavzuId: mavzuId
        });
    },
    //barchasini olish
    getAll: function () {
        return Testlar.find();
    },
    //bitta testni nomi bilan olish
    getOne: function (testId) {
        return Testlar.findOne({
            testId: testId
        });
    },
    //Test nomini o'zgartirish
    changeKeys: function (_id, testKey) {
        return Testlar.updateOne({
            _id: _id
        }, {
            $set: {
                testKey: testKey
            }
        });
    },
     deleteById: (_id) => {
        return Testlar.deleteOne({
            _id: _id
        })
    },
    deleteByName: (testId) => {
        return Testlar.deleteOne({
            testId: testId
        })
    }


}