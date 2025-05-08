import {Class} from './class';
import {Student} from './student';
import {User} from "./users";
import {School} from "./school";
import {SchoolPrincipal} from "./school_principal";

Class.hasMany(Student, {foreignKey: 'class_id', as: 'students'});
Class.belongsTo(User, {foreignKey: 'teacher_id', as: 'teacher'});
Student.belongsTo(Class, {foreignKey: 'class_id'});

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

Class.belongsTo(School, {foreignKey: 'school_id'});