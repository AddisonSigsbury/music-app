require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Generative AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Endpoint to Generate Recommendations
app.post('/recommend', async (req, res) => {
    const { artists } = req.body;

    if (!artists || artists.length === 0) {
        return res.status(400).json({ error: 'Artists list is required.' });
    }

    try {
        // Create a prompt based on user input
        const prompt = `Please act like you work at a record store and you are an expert at recommending new music to 
		customers. Act like I am a customer and recommend exactly 5 songs, exactly  5 albums, and exactly 5 similar artists 
		to these artists/songs/albums: ${artists.join(', ')}. From now on, do not provide any duplicates recommend anything 
		created by the given artists and make absolutely sure that the json array has 15 objects. Please also make sure that
		every single recommendation is from a different artist. For example, if you recommend one artist x, do not also
		recommend any songs or albums from artist x.
        Provide recommendations in this exact JSON format with an array of length 15:

        [
          {
            "artist": "Artist Name",
            "type": "artist",
            "reason": "Reason for recommendation, about 2 sentences long"
          },
          {
            "album": "Album Name",
			"artist2": "Artist Name",
            "type": "album",
            "reason": "Reason for recommendation, about 2 sentences long"
          },
		  {
			"song": "Song Name",
			"artist2": "Artist Name",
			"type": "song",
			"reason": "Reason for recommendation, about 2 sentences long"
		  }
        ]
        Only return the JSON. Do not include any additional text or explanations.
        `;

        // Generate recommendations using Generative AI
        const result = await model.generateContent(prompt);
        const rawResponse = result.response.text(); // Assuming `.text()` retrieves the raw response

        console.log('Raw AI Response:', rawResponse); // Debug log

        // Extract the JSON part using a regular expression
        const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);

        if (!jsonMatch || !jsonMatch[1]) {
            return res.status(500).json({ error: 'Invalid response format from AI' });
        }

        const recommendations = JSON.parse(jsonMatch[1]); // Parse the extracted JSON

        res.json({ recommendations });
    } catch (error) {
        console.error('Error generating recommendations:', error.message);
        res.status(500).json({ error: 'Failed to fetch recommendations.' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const SpotifyWebApi = require('spotify-web-api-node');

// const app = express();
// const port = 5000;

// // Middleware
// app.use((req, res, next) => {
//     // Relax CSP during development (for local testing)
//     res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
//     next();
// });
// app.use(cors());
// app.use(express.json());
// //app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));

// // Initialize Generative AI Client
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// // Define the root route to respond with a welcome message or redirect to the login page
// // app.get('/', (req, res) => {
// //     res.redirect('/login'); // Redirect to the login endpoint
// // });


// // Initialize Spotify API Client
// const spotifyApi = new SpotifyWebApi({
//     clientId: process.env.SPOTIFY_CLIENT_ID,
//     clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
//     redirectUri: 'http://localhost:5000/callback', // Adjust for production
// });

// // Endpoint: Login to Spotify
// app.get('/login', (req, res) => {
//     const scopes = ['user-top-read'];
//     const authURL = spotifyApi.createAuthorizeURL(scopes);
//     res.redirect(authURL);
// });

// // Endpoint: Spotify Callback
// const axios = require('axios');

// app.get('/callback', async (req, res) => {
//     const code = req.query.code || null;

//     if (!code) {
//         console.error('No code received in callback');
//         return res.status(400).send('Authentication failed: No code received');
//     }

//     try {
//         console.log('Exchanging code for token...');
//         const response = await axios.post('https://accounts.spotify.com/api/token', null, {
//             params: {
//                 grant_type: 'authorization_code',
//                 code,
//                 redirect_uri: 'http://localhost:5000/callback', // Ensure this matches your Spotify app settings
//                 client_id: process.env.SPOTIFY_CLIENT_ID,
//                 client_secret: process.env.SPOTIFY_CLIENT_SECRET,
//             },
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//         });

//         console.log('Spotify token response:', response.data);
//         const { access_token } = response.data;

//         // Redirect to the frontend with the access token
//         res.redirect(`http://localhost:5500?token=${access_token}`);
//     } catch (error) {
//         console.error('Error during token exchange:', error.response?.data || error.message);
//         res.status(500).send('Authentication failed: Unable to exchange token');
//     }
// });


// // Endpoint: Get User's Top 5 Artists
// app.get('/top-artists', async (req, res) => {
//     try {
//         const data = await spotifyApi.getMyTopArtists({ limit: 5 });
//         const topArtists = data.body.items.map((artist) => artist.name);
//         res.json({ topArtists });
//     } catch (error) {
//         console.error('Error fetching top artists:', error);
//         res.status(500).json({ error: 'Failed to fetch top artists.' });
//     }
// });

// // Endpoint: Generate Recommendations
// app.post('/recommend', async (req, res) => {
// 	    const { artists } = req.body;
	
// 	    if (!artists || artists.length === 0) {
// 	        return res.status(400).json({ error: 'Artists list is required.' });
// 	    }
	
// 	    try {
// 	        // Create a prompt based on user input
// 	        const prompt = `Please act like you work at a record store and you are an expert at recommending new music to customers. Act like 
// 			I am a customer and recommend exactly 5 songs, exactly  5 albums, and exactly 5 similar artists to these 
// 			artists/songs/albums: ${artists.join(', ')}. 
// 	        Do not recommend anything created by the given artists and make absolutely sure that the json array has 15 objects. 
// 	        Provide recommendations in this exact JSON format:
	
// 	        [
// 	          {
// 	            "artist": "Artist Name",
// 	            "type": "artist",
// 	            "reason": "Reason for recommendation, about 2 sentences long"
// 	          },
// 	          {
// 	            "album": "Album Name",
// 				"artist2": "Artist Name",
// 	            "type": "album",
// 	            "reason": "Reason for recommendation, about 2 sentences long"
// 	          },
// 			  {
// 				"song": "Song Name",
// 				"artist2": "Artist Name",
// 				"type": "song",
// 				"reason": "Reason for recommendation, about 2 sentences long"
// 			  }
// 	        ]
// 	        Only return the JSON. Do not include any additional text or explanations.
// 	        `;
	
// 	        // Generate recommendations using Generative AI
// 	        const result = await model.generateContent(prompt);
// 	        const rawResponse = result.response.text(); // Assuming `.text()` retrieves the raw response
	
// 	        console.log('Raw AI Response:', rawResponse); // Debug log
	
// 	        // Extract the JSON part using a regular expression
// 	        const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
	
// 	        if (!jsonMatch || !jsonMatch[1]) {
// 	            return res.status(500).json({ error: 'Invalid response format from AI' });
// 	        }
	
// 	        const recommendations = JSON.parse(jsonMatch[1]); // Parse the extracted JSON
	
// 	        res.json({ recommendations });
// 	    } catch (error) {
// 	        console.error('Error generating recommendations:', error.message);
// 	        res.status(500).json({ error: 'Failed to fetch recommendations.' });
// 	    }
// 	});

// // Start Server
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });
