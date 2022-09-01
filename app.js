const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
app.use(bodyparser.urlencoded({extended: true}));
app.set('view engine','ejs');
items=[];
// adding mongoDB to To-Do list...
mongoose.connect('mongodb+srv://admin-pushpak:Test123@cluster0.y6404gs.mongodb.net/todolistDB');
//schema for todo list
const itemsSchema = new mongoose.Schema({
    name: String,
});
//model for toddo list
const Item = mongoose.model("item",itemsSchema);
// Adding default items to the list...
const item1 = new Item({
    name: "Welcome to To-Do App",
});
const item2 = new Item({
    name: "Hit the add button to add new item",
});
const item3 = new Item({
    name: "<-- Hit to delete an item.",
});
// creating a default array to hold first three items in an array
const defaultItems = [item1,item2,item3];
app.listen(process.env.PORT | 3000, function(req, res){
    console.log("Server running on port 3000");
});

app.get('/', function(req, res){
    var today = new Date();
    var options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    };
    const TODO = "To-Do List";
    var day = today.toLocaleDateString("en-US", options);
    // priting all the elements using find() cmd and alloting it to 
    Item.find({},function(err,foundItems){

        if(foundItems.length===0){
            // see docs to insert multiple data at once link: https://mongoosejs.com/docs/api/model.html#model_Model-insertMany
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Sucessfully inserted the elements to DB...");
                }
            });
            res.redirect('/');
        }
        else{
            res.render('list',{kindOfDay: day, newItem: foundItems,listTitle: "To-Do List"});
        }
    });
});

app.post('/',function(req, res){
    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName,
    });
    item.save();
    res.redirect('/');
});

app.post('/delete',function(req,res){
    const checkedItemID = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemID, function(err,){
        if(err){
            console.log(err);
        }
        else{
            console.log("Sucessfully deleted");
            res.redirect('/');
        }
    });
});
const listSchema = {
    name: String,
    items: [itemsSchema],
};
const List = mongoose.model('List',listSchema);

app.get('/:CustomListName',function(req,res){
    const customListName = req.params.CustomListName;
    List.findOne({name: customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                // create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems,
                });
                list.save();
                res.redirect('/'+ customListName);
            }
        }
        else{
            // Show an existing list
            res.render('list',{kindOfDay: day, newItem: foundList.items,listTitle: foundList.name});
        }
    })

});

