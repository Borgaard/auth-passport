var express = require('express'),
    app = express(),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    ejs = require('ejs'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser());
app.use(bodyParser.urlencoded({'extended': true}));
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}));

var users = [{id: 1,
							username: "Art", 
							password: "pancakes", 
							email: "art@wafflesarebad.com"}, 
             {id: 2, 
             	username: "Nicole", 
             	password: "cupcakes", 
             	email: "nicole@downwithmuffins.com"}];

function findByUsername(username, fn) {
	for (var i = 0, len = users.length; i < len; i++) {
		var user = users[i];
		if (user.username === username) {
			return fn(null, user);
		}
	}
	return fn(null, null);
}

function findById(id, fn) {
	var idx = id - 1;
	if (users[idx]) {
		fn(null, users[idx]);
	} else {
		fn(new Error('User '+ id +' does not exist'));
	}
}

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	findById(id, function(err, user) {
		done(err, user);
	});
});

var localStrategy = new LocalStrategy(function(username, password, done) {
	findByUsername(username, function(err, user) {
		if (err) { return done(err); }
		if (!user) { return done(null, false, { message: 'Unknown user ' +username }); }
		if (user.password != password) { return done(null, false, { message: 'Invalid password, prepare for goblin attack' }); }
		return done(null, user);
	})
})

passport.use(localStrategy);

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
	var user = req.user
	res.render('index', {user: user});
});

app.get('/login', function(req, res) {
	res.render('login');
});

app.get('/profile', function(req, res) {
	//console.log(req.user);
	var user = req.user
	res.render('profile', {person: user});
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/')
});

app.post('/logmein', passport.authenticate('local', 
	{failureRedirect: '/login'}), function(req, res) {
	res.redirect('/profile');
});

app.listen(8080, function() {
	console.log("Authentication app on 8080!");
});
























