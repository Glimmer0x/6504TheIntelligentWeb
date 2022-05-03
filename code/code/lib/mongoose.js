//先引入mongoose模块
let mongoose = require("mongoose");
//连接数据库服务器
mongoose.connect('mongodb://127.0.0.1:27017/mydb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (error) {
    if (error) {
        console.log("数据库连接失败")
    } else {
        console.log("数据库连接成功")
    }
})
//导出
module.exports = mongoose;