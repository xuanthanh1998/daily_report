var DataTypes = require("sequelize").DataTypes;
var _student = require("./student");

function initModels(sequelize) {
  var student = _student(sequelize, DataTypes);


  return {
    student,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
