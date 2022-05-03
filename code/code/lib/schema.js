//引入mongoose.js文件
let mongoose = require("./mongoose.js")
//定义schema
let schema = mongoose.Schema
const story=new schema({
    //这里是数据库自己创建的属性名：他的属性类型   如：
    img:
        {
            data: Buffer,
            contentType: String
        },
    desc: String,
    name: String
})
//导出
module.exports = story;

