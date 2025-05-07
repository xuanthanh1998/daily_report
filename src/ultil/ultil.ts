import { Response } from 'express';

interface ApiResponse<T = any> {
    error_code: number;
    data: T | null;
    error_msg: string | null;
}

/**
 * Trả về response thành công
 * @param res - Đối tượng Response của Express
 * @param data - Dữ liệu muốn trả về
 * @param message - Thông báo kèm theo
 */
export function sendData<T>(res: Response, data: T, message: string | null = null) {
    const response: ApiResponse<T> = {
        error_code: 0,
        data,
        error_msg: message
    };
    return res.json(response);
}

/**
 * Trả về response khi có lỗi
 * @param res - Đối tượng Response của Express
 * @param message - Thông báo lỗi
 * @param error_code - Mã lỗi (mặc định là 1)
 */
export function sendError(res: Response, message: string, error_code: number = 1) {
    const response: ApiResponse = {
        error_code,
        data: null,
        error_msg: message
    };
    return res.status(400).json(response);
}
