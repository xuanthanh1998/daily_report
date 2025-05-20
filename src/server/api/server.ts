import app from '../../app';
import {sequelize} from '../../config/mysql';
import {connectMongo} from '../../config/mongo';
import {pgSequelize} from '../../config/postgres';
import {kafkaProducer} from "../../kafka/kafka";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL connected');

        await pgSequelize.authenticate();
        console.log('✅ PostgreSQL connected');

        await connectMongo();
        console.log('✅ MongoDB connected');

        await kafkaProducer.connect();
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Server failed to start:', err);
    }
};

startServer();
