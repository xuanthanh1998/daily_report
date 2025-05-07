import type { Sequelize } from "sequelize";
import { student as _student } from "./student";
import type { studentAttributes, studentCreationAttributes } from "./student";

export {
  _student as student,
};

export type {
  studentAttributes,
  studentCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const student = _student.initModel(sequelize);


  return {
    student: student,
  };
}
