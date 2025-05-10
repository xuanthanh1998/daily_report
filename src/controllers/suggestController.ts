import {Request, Response} from 'express';
import {getCollection} from '../config/mongo';
import {sendData, sendError} from '../ultil/ultil';
import {ObjectId} from 'mongodb';

//lấy danh sách gợi ý từng giáo viên
export const getSuggestByTeacher = async (req: Request, res: Response): Promise<any> => {
    try {
        const collection = await getCollection('suggest');
        const type = parseInt(req.query.type as string);
        const teacherId = parseInt(req.query.teacher_id as string);
        if (isNaN(teacherId) || isNaN(type)) {
            return res.status(400).json({
                error_code: 1,
                message: 'Invalid query parameters'
            });
        }

        const data = await collection.find({
            type: type,
            $or: [
                {teacher_id: teacherId},
                {is_default: 0},
            ]
        }).toArray();

        res.json({error_code: 0, data: data, message: 'Success'});
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({error_code: 1, message: 'Failed to get suggestions'});
    }
};

//tạo gợi ý cho giáo viên
export const createSuggestByTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const collection = await getCollection('suggest');
        const {text, teacher_id, type} = req.body;

        const result = await collection.insertOne({
            text: text,
            teacher_id: teacher_id,
            type: type,
            is_default: 1,
            create_datetime: new Date(),
            update_datetime: new Date(),
        });

        sendData(res, result, 'Success');
    } catch (error) {
        console.error('Error create suggestion:', error);
        res.status(500).json({error_code: 1, message: 'Failed to create suggestion'});
    }
};

// cập nhật gợi ý giáo viên
export const updateSuggestByTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const collection = await getCollection('suggest');
        const id = req.body._id;
        const {text} = req.body;

        const result = await collection.findOneAndUpdate(
            {_id: new ObjectId(id)},
            {
                $set: {
                    text: text,
                    update_datetime: new Date(),
                }
            },
            {returnDocument: 'after'}
        );

        sendData(res, result, 'Success');
    } catch (error) {
        console.error('Error updating suggestion:', error);
        res.status(500).json({error_code: 1, message: 'Failed to update suggestion'});
    }
};

//xóa gợi ý giáo viên
export const deleteSuggestByTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const {ids} = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({error_code: 1, message: 'Invalid or empty list of IDs'});
        }

        const objectIds = ids
            .filter((id: string) => ObjectId.isValid(id))
            .map((id: string) => new ObjectId(id));

        if (objectIds.length === 0) {
            res.status(400).json({error_code: 1, message: 'No valid ObjectIds found'});
        }

        const collection = await getCollection('suggest');
        const result = await collection.deleteMany({_id: {$in: objectIds}});

        if (result.deletedCount === 0) {
            res.status(404).json({error_code: 1, message: 'No suggestions found to delete'});
        }

        sendData(res, result, 'Suggestions deleted successfully');
    } catch (error) {
        res.status(500).json({error_code: 1, message: 'Failed to delete suggestions'});
    }
};

