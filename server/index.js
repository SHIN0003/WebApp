const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
const session = require('express-session');
let arr = ["hello", "world"];
// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));


// Your Spotify credentials set in the .env file
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

app.get('/home', cors(), async (req, res) => {
  res.send("This is data for home page");
  //res.send(arr);
});

// Redirect users to this endpoint for Spotify login
app.get('/login', (req, res) => {
  const scopes = ['user-read-private', 'user-read-email', 'playlist-read-private'];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.post('/logout', cors(), (req, res) => {
  console.log("Logout endpoint hit"); // Step 2
  console.log(req.session); // Step 3

  req.session.destroy((err) => {
    if (err) {
      // Handle error - the session was not destroyed
      res.status(500).send('Could not log out, please try again');
    } else {
      // Session destroyed, reset credentials
      spotifyApi.resetCredentials();

      // Send the response
      res.send("Logged out");
    }
  });
});

// Spotify will redirect users to this endpoint after login
app.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi.authorizationCodeGrant(code).then(data => {
    const accessToken = data.body['access_token'];
    const refreshToken = data.body['refresh_token'];
    const expiresIn = data.body['expires_in'];

    req.session.user = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: expiresIn,
    };

    console.log(req.session)

    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    console.log('access_token:', accessToken);
    console.log('refresh_token:', refreshToken);

    // Set the access token on the API object to use it in later calls
    res.send('Success! You can now close the window.');

  }).catch(error => {
    console.error('Error getting Tokens:', error);
    res.send(`Error getting Tokens: ${error}`);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
