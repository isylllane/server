const uuid = require('uuid');
const path = require('path');
const {Device} = require('../models/models');
const ApiError = require('../error/ApiError');
const {DeviceInfo} = require('../models/models');

class DeviceController {
    async create(req, res, next) {
        try {
            let {name, price, brandId, typeId, info} = req.body
            const {img} = req.files

            // **1. Получаем расширение файла**
            const fileExtension = path.extname(img.name).toLowerCase();  // Получаем расширение файла из имени
            if (fileExtension !== '.gif') { // **2. Проверяем, что это GIF**
                return next(ApiError.badRequest('Допустимы только GIF-файлы'));
            }

            let fileName = uuid.v4() + fileExtension; // **3. Используем расширение GIF**
            img.mv(path.resolve(__dirname, '..', 'static', fileName));
            const device = await Device.create({name, price, brandId, typeId, img: fileName});

            if (info) {
                info = JSON.parse(info)
                info.forEach(i =>
                    DeviceInfo.create({
                        title: i.title,
                        description: i.description,
                        deviceId: device.id
                    })
                )
            }

            return res.json(device)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }

    async getAll(req, res) {
        let {brandId, typeId, limit, page} = req.query;
        page = page || 1;
        limit = limit || 10;
        let offset = page * limit - limit;

        let devices;
        if (!brandId && !typeId) {
            devices = await Device.findAndCountAll({limit: limit, offset: offset});
        }
        if (brandId && !typeId) {
            devices = await Device.findAndCountAll({where: {brandId}, limit: limit, offset: offset});

        }
        if (!brandId && typeId) {
            devices = await Device.findAndCountAll({where: {typeId}, limit: limit, offset: offset});

        }
        if (brandId && typeId) {
            devices = await Device.findAndCountAll({where: {typeId, brandId}, limit: limit, offset: offset});

        }
        return res.json(devices)
    }

    async getOne(req, res) {
        const {id} = req.params
        const device = await Device.findOne(
            {
                where: {id},
                include: [{model: DeviceInfo, as: 'info'}]
            },
        )
        return res.json(device)
    }
}

module.exports = new DeviceController();
