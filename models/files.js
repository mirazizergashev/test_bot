var {Files} = require('./schemes');

module.exports = {
    //yaratish
    create: function (files) {
        return new Files(files).save();
    },
    //barchasini olish
    getAll: function ( mavzuId) {
        return Files.find({
            mavzuId: mavzuId
        }).sort({
            _id: 1
        });

    },
    //bitta sinfni nomi bilan olish
    getOne: function (_id) {
        return Files.findById(_id);
    },
    //Test nomini o'zgartirish
    changeAbout: function (_id,about) {
        return Files.updateOne({
           _id:_id
        }, {
            $set: {
                about: about
            }
        });
    },
    changeFileTuri: function (_id,file_turi) {
        return Files.updateOne({
           _id:_id
        }, {
            $set: {
                file_turi: file_turi
            }
        });
    },

    delete: (_id) => {
        return Files.findByIdAndRemove(_id)
    }


}