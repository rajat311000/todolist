const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://rajatjain3276:vBa4F4NCwz6cenkr@cluster0.ds38blz.mongodb.net/?retryWrites=true&w=majority')
const db = mongoose.connection;
// error

db.on('error',console.error.bind(console,'erroe connecting to db'));
// up and running then message
db.once('open',function(){
    console.log('Success fully connected to the database')
})