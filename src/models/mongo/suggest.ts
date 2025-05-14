import mongoose, {Schema, Document} from 'mongoose';

export interface ISuggest extends Document {
    text: string;
    type: number;
    class_id: number | null;
    teacher_id: number | null;
    is_default: number | null;
    create_datetime: Date;
    update_datetime: Date;
}

const SuggestSchema: Schema = new Schema(
    {
        text: {type: String, required: true},
        type: {type: Number, required: true},
        class_id: {type: Number, default: null},
        teacher_id: {type: Number, default: null},
        is_default: {type: Number, required: true},
    },
    {
        collection: 'suggest',
        timestamps: {
            createdAt: 'create_datetime',
            updatedAt: 'update_datetime'
        },
        versionKey: false
    }
);

export default mongoose.model<ISuggest>('Suggest', SuggestSchema);
