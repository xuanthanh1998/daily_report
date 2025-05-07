import { Request, Response } from 'express';
import { Student } from '../models/student';
import { sendData } from '../ultil/ultil';

export const getListStudent = async (req: Request, res: Response) => {
    try {
        const data = await Student.findAll();
        return sendData(res, data, 'Success');
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

