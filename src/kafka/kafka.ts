import { Kafka, Partitioners } from 'kafkajs';

export const kafka = new Kafka({
    clientId: 'school-service',
    brokers: ['localhost:9092'],
});

export const kafkaProducer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
});
