require('colors')

const path = require('path')

// express
const express = require('express')
const app = express()
// socket
const server = require('http').createServer(app)
const io = require('socket.io').listen(server, {
	serveClient: false,
})

const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const port = 8020


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Création du server
app.use( express.static('client') );

// middleware qui permet d'autoriser les requête Ajax provenant d'un autre domaine
app.use( (req, res, next) => {
	// le serveur accepte les requête ajax qui proviennent de tous les domaines
	let p = ['http://localhost:8080', 'http://localhost:8081', 'http://192.168.21.124:8080', 'http://192.168.21.124:8081']
	if (p.indexOf(req.headers.origin) > -1) {
		res.header('Access-Control-Allow-Origin', req.headers.origin)
	}
	// autorise les type de requête get put post et delete
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
	// autorise le Content-Type pour la réponse
	res.header('Access-Control-Allow-Headers', 'Content-Type')
	// j'sais pas ce que ça fait
	res.header('Access-Control-Allow-Credentials', 'true')
	next()
})

io.on('connection', () => {
	console.log(`Somone just connected`)
})

// CRUD Prospects
const prospect = require('./src/controller/Prospect.controller')
app.post 		('/prospect', 				(req, res) => {
	prospect.create(req, res)
	io.sockets.emit( 'prospectAdd', req.body )
})
app.get 		('/prospect', 				prospect.findAll)
app.get 		('/prospect/:id', 		prospect.find)
app.put 		('/prospect/:id', 		prospect.update)
app.delete 	('/prospect/:id', 		prospect.remove)

// CRUD Campaigns
const campaign = require('./src/controller/Campaign.controller')
app.post 		('/campaign', 				(req, res) => {
	campaign.create(req, res)
	io.sockets.emit( 'prospectAdd', req.body )
})
app.get 		('/campaign', 				campaign.findAll)
app.get 		('/campaign/:id', 		campaign.find)
app.put 		('/campaign/:id', 		campaign.update)
app.delete 	('/campaign/:id', 		campaign.remove)

// CRUD Admin accounts
const admin = require('./src/controller/Admin.controller')
app.post 		('/admin', 				(req, res) => {
	admin.create(req, res)
	io.sockets.emit( 'adminAdd', req.body )
})
app.get 		('/admin', 							admin.findAll)
app.get 		('/admin/:id', 					admin.find)
app.put 		('/admin/password/:id', admin.updatePassword)
app.delete 	('/admin/:id', 					admin.remove)

// Indique à mongoose que les promesse à utiliser
// sont celles par défaut dans Node.js (objet global)
mongoose.Promise = global.Promise

// Connexion à la base de données MONGO
// 'mongodb://localhost:27017/pdc' qu'est-ce que c'est ?
// 		Quand on se connecte à la bdd mongoose en lançant `mongo`
// 		dans la console, il est indiqué `connecting to: mongodb://127.0.0.1:27017`
// 		127.0.0.1 = localhost
// 		27017 = port utilisé (arbitrairement) par mongo
// 		pdc = nom de la bdd (`use pdc` dans mongo)
mongoose.connect('mongodb://localhost:27017/pdc', { useMongoClient: true })
	// Une fois connecté ( .then( successCallback(), errorCallback() ) )
	.then(
		() => console.log(' MongoDB '.bgGreen, 'Connection établie !'.green),
		() => console.log(' MongoDB error '.bgRed, 'Auriez vous oublié de lancer `mongod` ?'.red)
	)
	// S'il y a eu une erreur sur le .connect() on lance le catch
	.catch(err => console.log('err::'.red, err))
	// Une fois le then ou le catch executé .then( successFuction() )
	.then(
		() => {
			// App écoute le port 8080, puis on execute une fonction de call back
			server.listen(
				port,
				() => console.log(' App Started '.bgGreen.black, `Le serveur http://localhost:${port} est prêt !`.green))
		}
	)