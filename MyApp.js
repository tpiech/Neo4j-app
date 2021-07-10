//****************************************************** */
var express = require("express")
var body_parser = require("body-parser")
//var ejs = require("ejs")
var logger = require("morgan")
var neo4j = require("neo4j-driver")
var path = require("path")

//@ import modulow
//****************************************************** */

//****************************************************** */

var myport = 1234
var app = express()
var logged_in
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
var logged_user
app.use(logger("dev"))
app.use(body_parser.json())
app.use(body_parser.urlencoded({extended: false}))
app.use(express.static(__dirname + "/public"))




app.get('/getAllUsers', function(req, res){
    session
        .run("MATCH(n:u6piech:User) RETURN n")
        .then(function(result){
            dataArr = []
            result.records.forEach(function(record){
                dataArr.push({
                    id: record._fields[0].identity.low,
                    name: record._fields[0].properties.name,
                    password: record._fields[0].properties.password
                })
            })
            res.render('Users', {
                MyData: dataArr
            })
        })
        .catch(function(error){
            console.log(error)
        });

})
app.get('/getAllGames', function(req, res){
    session
        .run("MATCH(n:u6piech:Game) RETURN n")
        .then(function(result){
            dataArr = []
            result.records.forEach(function(record){
                dataArr.push({
                    id: record._fields[0].identity.low,
                    name: record._fields[0].properties.name,
                    dev: record._fields[0].properties.developer,
                    rl: record._fields[0].properties.release_year,
                    type: record._fields[0].properties.type
                })
            })
            res.render('Games', {
                MyData: dataArr
            })
        })
        .catch(function(error){
            console.log(error)
        });

})

app.get('/GetDependency', function(req, res){

    session
        .run("MATCH (g:u6piech:Game)<-[r:bought]-(u:u6piech:User{name:$uname}) RETURN u.name, g.name, r", {uname:logged_user})
        .then(function(result){
            dataArr = []
            result.records.forEach(function(record){

                dataArr.push({
                    username: record._fields[0],
                    gamename: record._fields[1],
                    rating: record._fields[2].properties.rating,
                    opinion: record._fields[2].properties.opinion
                })

            })
            res.render('ListOfOrders',{
                MyData: dataArr
            })
        })
        .catch(function(error){
            console.log(error)
        });

})


app.get('/GetAllDependencies', function(req, res){

    session
        .run("MATCH (g:u6piech:Game)<-[r:bought]-(u:User) RETURN u.name, g.name, r")
        .then(function(result){
            dataArr = []
            result.records.forEach(function(record){

                dataArr.push({
                    username: record._fields[0],
                    gamename: record._fields[1],
                    rating: record._fields[2].properties.rating,
                    opinion: record._fields[2].properties.opinion
                })

            })
            res.render('ListOfOrders',{
                MyData: dataArr
            })
        })
        .catch(function(error){
            console.log(error)
        });

})


app.get('/AddNewGame', function(req, res){
    session
        .run("MATCH(n) RETURN n")
        .then(function(result){

            res.render('AddGame')})
        .catch(function(error){
            console.log(error)
        })

})


app.get('/AddNewOrder', function(req, res){
    session
        .run("MATCH(n:u6piech:Game) RETURN n")
        .then(function(result){
            dataArr = []
            result.records.forEach(function(record){
                dataArr.push({
                    id: record._fields[0].identity.low,
                    name: record._fields[0].properties.name,
                    dev: record._fields[0].properties.developer,
                    rl: record._fields[0].properties.release_year,
                    type: record._fields[0].properties.type
                })
            })
            res.render('BuyGame', {MyData: dataArr, logged_user:logged_user})
        })
        .catch(function(error){
            console.log(error)
        })

})


app.get('/AddNewUser', function(req, res){
    session
        .run("MATCH(n) RETURN n")
        .then(function(result){
            res.render('AddUser')})
        .catch(function(error){
            console.log(error)
        })

})

app.get('/', function(req, res){
    console.log(logged_in)
    if(!logged_in){
        res.render('unlogged_index')
    }
    else{
        res.render('index', {logged_user:logged_user})
    }
})

app.get('/log_in_get', function(req, res){
    session
        .run("MATCH(n) RETURN n")
        .then(function(result){
            res.render('login')})
        .catch(function(error){
            console.log(error)
        })
})
app.get('/log_out', function(req, res){
    session
        .run("MATCH(n) RETURN n")
        .then(function(result){
            logged_in = false
            logged_user = ""
            res.render('unlogged_index')})
        .catch(function(error){
            console.log(error)
        })
})


app.get('/getOpinionsPage', function(req, res){
    dataArr = []
    session
        .run('MATCH(n:u6piech:Game) RETURN n')
        .then(function(result){
            result.records.forEach(function(record){
                //console.log(record._fields[0].properties.name)
                dataArr.push({
                    game_name: record._fields[0].properties.name
                })
            })
            res.render('OpinionPage', {MyData: dataArr})
        })
        .catch(function(error){
            console.log(error)
        })
})


app.get('/specUser', function(req, res){
    session
        .run('MATCH(n:u6piech:Game) RETURN n')
        .then(function(result){
            res.render('specUsersRatings')
        })
        .catch(function(error){
            console.log(error)
        })
})


app.post("/searchUser", function(req, res){
    var usrname = req.body.user_name
    dataArr = []
    session
    .run("MATCH (g:u6piech:Game)<-[r:bought]-(u:User{name:$musrname}) RETURN u.name, g.name, r", {musrname:usrname})
    .then(function(result){
        result.records.forEach(function(record){
            dataArr.push({
                user_name: record._fields[0],
                game_name: record._fields[1],
                opinion: record._fields[2].properties.opinion,
                rating: record._fields[2].properties.rating
            })
        })
        res.render('specUserRatingsRes', {MyData: dataArr})
    })
    .catch(function(error){
        console.log(error)
    })
})

app.post('/getOpinions', function(req, res){
    var gamename = req.body.game_name
    dataArr = []
    session
    .run("MATCH (g:u6piech:Game{name:$gamename})<-[r:bought]-(u:User) RETURN u.name, g.name, r", {gamename:gamename})
    .then(function(result){
        result.records.forEach(function(record){
            //console.log(record._fields[0])
            dataArr.push({
                game_name: gamename,
                user_name: record._fields[0],
                opinion: record._fields[2].properties.opinion,
                rating: record._fields[2].properties.rating
            })
        })
        res.render('OpinionPageRes', {MyData: dataArr})
    })
    .catch(function(error){
        console.log(error)
    })

})


app.post('/log_in_post', function(req, res){
    var mlogged_user = req.body.usrname
    var musrPass = req.body.psw
    session
        .run('MATCH(n:u6piech:User{name:$usr, password:$pwd}) RETURN n', {usr:mlogged_user, pwd:musrPass})
        .then(function(result){
            dataArr = []
            result.records.forEach(function(record){
                if(mlogged_user == record._fields[0].properties.name && musrPass == record._fields[0].properties.password ){
                    logged_user = mlogged_user
                    logged_in = true
                    res.render('index',{logged_user:logged_user}) 
                }
                else{
                    logged_in = false
                    res.render('unlogged_index') 
                }
            })
        })
        
        
        .catch(function(error){
            console.log(error)
        })


})

app.post('/AddGame', function(req, res){

    var name = req.body.game_name
    var dev = req.body.dev
    var year = req.body.year
    var gtype = req.body.type
    
    session
       .run("CREATE(n:u6piech:Game{name: $pname, developer: $pdev, release_year: $pyear, type:$ptype }) RETURN n;", {pname:name, pdev:dev, pyear:year, ptype: gtype})
       .then(function(result){
        res.redirect('/')
        session.close()
       })
       .catch(function(error){
            console.log(error)
        });
        res.redirect('/')
    

})

app.post('/AddUser', function(req, res){

    var name = req.body.user_name
    var pass = req.body.password
    var email = req.body.email
    session
        .run("CREATE(b:u6piech:User{name:$username, password:$ppass, email:$pemail}) RETURN b;", {username:name, ppass:pass, pemail:email})
        .then(function(resp){
            res.redirect('/')
            session.close()
        })
        .catch(function(error){
            console.log(error)
        });
        res.redirect('/')

})


app.post('/AddDependency', function(req, res){
    var gamename = req.body.game_name
    var opinion = req.body.opinion
    var rating = req.body.rating
    session
        .run("MATCH (u:u6piech:User{name:$username}), (g:Game{name:$gamename}) MERGE (u)-[r:bought{opinion:$mopinion, rating:$mrating}]->(g) RETURN u,g", {username:logged_user, gamename:gamename, mopinion:opinion, mrating:rating})
        .then(function(resp){
            res.redirect('/')
            session.close()
        })
        res.redirect('/')


})

//var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "1234"))
var driver = neo4j.driver("bolt://neo4j.fis.agh.edu.pl:7687", neo4j.auth.basic("u6piech", "290503"))
var session = driver.session()

//@ ustawienia aplikacji, funkcje stosowane w aplikacji
//****************************************************** */

app.listen(myport)
console.log("APP LISTENING AT PORT: " + myport)

module.exports = app