//引入mongoose.js 文件
let mongoose = require("./mongoose");
//引入schema.js 文件
let schema = require("./schema");
//定义模型 表名为appModel
let story = mongoose.model("story", schema);
//导出
module.exports = story;