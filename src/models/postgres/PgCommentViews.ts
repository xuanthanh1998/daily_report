import {DataTypes} from 'sequelize';
import {pgSequelize} from '../../config/postgres';

export const PgCommentViews = pgSequelize.define('PgCommentViews', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    view_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    create_datetime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    update_datetime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'pg_comment_views',
    schema: 'public',
    timestamps: false,
});
