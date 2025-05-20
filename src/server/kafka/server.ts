import { runConsumer } from '../../service/dailyReport.service';
import { kafkaProducer } from '../../kafka/kafka';

const startServer = async () => {
    try {
        runConsumer().catch(console.error);
        kafkaProducer.connect().then(() => {
            console.log('Kafka Producer connected');
        });
    } catch (err) {
        console.error('Kafka failed to start:', err);
    }
};

startServer();
