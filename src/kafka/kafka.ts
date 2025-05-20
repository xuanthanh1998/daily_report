import { Kafka, Partitioners } from 'kafkajs';

export const kafka = new Kafka({
    clientId: 'school-service',
    brokers: ['127.0.0.1:9092'],
});

export const kafkaProducer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
});
