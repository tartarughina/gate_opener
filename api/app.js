const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');

const db = require('./sqlite');
const ewelink = require('./ewelink');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/*
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(err.status || 404).json({
    message: "No such route exists"
  })
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: "Error Message"
  })
});
*/
/*
app.get('/', (req, res) => {
  res.send(`
  <html>
    <head>
        <title>Gate Opener</title>
    </head>
    <body>
      <div style="display:flex;flex:1;justify-content:center;align-items:center;height:100%;">
        <div>
            <h3 style="text-align:center;">Welcome to the Gate Opener webapp</h3>
            <p style="text-align:center;">Work in progress</p>
        </div>
      </div>
    </body>
  </html>
  `).end();
})
*/
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/get_devices', (req, res) => {
  db.get_devices().then((rows) => {
    if(rows){
      res.status(200).json({devices: rows, error: 'None'}).end();
    }
    else{
      res.status(204).json({devices: null, error: 'No device exists'}).end();
    }
  })
})

app.post('/get_triggers', (req, res) => {
  const start = req.body.start;
  const end = req.body.end;
  const user = req.body.user;
  const hash = req.body.hash;

  db.has_user_privilege(user, hash)
  .catch((err) => {res.status(204).json(err).end()})
  .then((result) => {
    if(result){
      db.get_triggers(start, end).then((result) => {
        if(result){
          res.status(200).json(result).end();
        }
        else{
          res.status(204).json(null).end();
        }
      })
    }
    else{
      res.status(200).json({error: "The user hasn't the right privilege"}).end();
    }
  })
})

app.post('/trigger_device', (req, res) => {
  const device = req.body.device;
  const user = req.body.user;
  const hash = req.body.hash;

  db.check_user(user, hash).then((row) => {
    if(row.status === 'OK'){
      ewelink.trigger_device(device).then((status) => {
        db.insert_trigger(user, device, status.status);

        res.status(200).json({status: status.status}).end();
      });
    }
    else{
      res.status(200).json({status: 'The user cannot do this action'}).end();
    }
  })
});

app.post('/create_user', (req, res) => {
  const name = req.body.name;
  const psw = req.body.psw;
  const privilege = {
    start_date: req.body.start,
    end_date: req.body.end,
    left_uses: req.body.uses,
  }

  db.insert_user(name, psw, privilege).then((status) => {
    if(status === 'ok'){
      res.status(200).json({message: 'User created'}).end()
    }
    else{
      res.status(200).json({message: 'User not created, an error occurred'})
    }
  })

})

app.post('/login', (req, res) => {
  const user = req.body.user;
  const psw = req.body.psw;
  
  db.login(user, psw).then((row) => {
    if(row){
      res.status(200).json({user: row, error: "None"}).end();
    }
    else
      res.status(200).json({user: null, error: "User or password are wrong"}).end()
  })
})

const server = app.listen(8080, async () => {
  await ewelink.prep_connection();
  
  console.log(`Gate opener listening at http://localhost:8080`)
})

process.on('SIGINT', () => {
  console.log("\nCaught interrupt signal");

  db.close();
  server.close();
  process.exit();
});