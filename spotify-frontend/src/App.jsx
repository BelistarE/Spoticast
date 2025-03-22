import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/top-tracks", { withCredentials: true })
      .then((response) => {
        setTracks(response.data.items);
      })
      .catch((error) => console.error("Error fetching tracks", error));
  }, []);

  return (
    <div>
      <h1>Your Spotify Top Tracks</h1>
      <a href="http://localhost:3001/login">Login with Spotify</a>
      <ul>
        {tracks.map((track, index) => (
          <li key={index}>
            <img src={track.album.images[0].url} alt={track.name} width="50" />
            {track.name} -{" "}
            {track.artists.map((artist) => artist.name).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
