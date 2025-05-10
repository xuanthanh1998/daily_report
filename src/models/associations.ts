import {Class} from './class';
import {Student} from './student';
import {User} from "./users";
import {School} from "./school";
import {SchoolPrincipal} from "./school_principal";
import {Teacher} from "./teacher";

Class.hasMany(Student, {foreignKey: 'class_id', as: 'students'});
Class.belongsTo(User, {foreignKey: 'teacher_id', as: 'teacher'});
Class.belongsTo(School, {foreignKey: 'school_id', as: 'school'});

Student.belongsTo(Class, {foreignKey: 'class_id'});
Teacher.belongsTo(User, {foreignKey: 'user_id', as: 'teachers'});

School.belongsToMany(User, {
    through: SchoolPrincipal,
    foreignKey: 'school_id',
    otherKey: 'user_id',
    as: 'principals'
});

User.belongsToMany(School, {
    through: SchoolPrincipal,
    foreignKey: 'user_id',
    otherKey: 'school_id',
    as: 'managedSchools'
});

School.hasMany(SchoolPrincipal, {
    foreignKey: 'school_id',
    as: 'schoolPrincipals'
});

SchoolPrincipal.belongsTo(School, {
    foreignKey: 'school_id'
});

School.hasMany(Class, {
    foreignKey: 'school_id',
    as: 'class'
});