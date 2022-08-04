const express = require("express")
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
var _ = require('lodash');

const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name:"Welcome to your todolist!"
});

const item2 = new Item({
    name:"Hit the + button to add a new item."
});

const item3 = new Item({
    name:"<-- Hit this button to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
    Item.find(function(err, results){
        if(err){
            console.log(err);
        }else{
            if(results.length === 0){
                Item.insertMany(defaultItems, function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Add defaultItems successfully!");
                    }
                });
            }
            res.render("list", {kindOfDay : "Today", newItem:results});
        }
    })
});

app.post("/", function(req, res){

    let item = req.body.newThing;
    let listName = req.body.button;
     
    let nItem = new Item({
        name:item
    })

    if(listName === "Today"){
        nItem.save();
        res.redirect("/");        
    }else{
        List.findOne({name:listName}, function(err, foundList){
            if(!err){
                if(foundList){
                    foundList.items.push(nItem);
                    foundList.save();
                }
            }
        })
        res.redirect("/"+listName);
    }
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    List.find({name:customListName}, function(err, item){
        if(err){
            console.log(err);
        }else{
            if(item.length ===0){
                const list = new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                res.render("list", {
                    kindOfDay:customListName,
                    newItem: item[0].items
                });
            }
        }
    });
});


app.get("/about", function(req, res){
    res.render("about");
});

app.post("/delete", function(req, res){
    const curId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.deleteOne({_id:curId}, function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Delete successfully! ");
            }
        })
        res.redirect("/");    
    }else{
        List.findOneAndUpdate({name:listName},{$pull: {items: {_id: curId}}},function(err, foundList){
            if(!err){
                res.redirect("/"+listName);
            }else{
                console.log(err);
            }
        })
    }
});
app.listen(3000, function(){
    console.log("Server waiting on port 3000 ...");
});