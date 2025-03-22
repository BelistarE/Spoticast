require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const querystring = require("querystring");

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3001/callback";

// Step 1: Redirect user to Spotify authorization page
app.get("/login", (req, res) => {
  const scope = "user-top-read"; // Permission to read top tracks
  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: CLIENT_ID,
      scope,
      redirect_uri: REDIRECT_URI,
    });
  res.redirect(authUrl);
});

// Step 2: Handle Spotify callback and exchange code for access token
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  if (!code) return res.status(400).send("Authorization code missing");

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token } = tokenResponse.data;
    res.cookie("access_token", access_token, { httpOnly: true });
    res.redirect("http://localhost:5173"); // Redirect to frontend
  } catch (error) {
    console.error(error);
    res.status(500).send("Authentication failed");
  }
});

// Step 3: Fetch user's top tracks
app.get("/top-tracks", async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) return res.status(401).send("Unauthorized");

  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.response.data });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
