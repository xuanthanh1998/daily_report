import app from './app';
import { sequelize } from './config/mysql';
import { connectMongo } from './config/mongo';
import { pgSequelize } from './config/postgres';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL connected');

        await pgSequelize.authenticate(); // ✅ Thêm dòng này
        console.log('✅ PostgreSQL connected');

        await connectMongo();
        console.log('✅ MongoDB connected');

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Server failed to start:', err);
    }
};

startServer();
