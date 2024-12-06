document.getElementById('artist-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const artistInput = document.getElementById('artist-input').value;

    if (!artistInput.trim()) {
        console.log("No input provided.");
        return;
    }

    const artists = artistInput.split(',').map((artist) => artist.trim());
    console.log("Artists submitted:", artists);

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Loading...';

    try {
        const response = await fetch('http://localhost:5000/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artists }),
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        const data = await response.json();
        console.log("Received data:", data);

        if (!Array.isArray(data.recommendations)) {
            console.error("Error: Invalid response format");
            resultsDiv.innerHTML = `<p>Error: Invalid response format</p>`;
            return;
        }

		const artistColumn = document.querySelector('#artist-column ul');
		const albumColumn = document.querySelector('#album-column ul');
		const songColumn = document.querySelector('#song-column ul');
		artistColumn.innerHTML = "";
		albumColumn.innerHTML = "";
		songColumn.innerHTML = "";
		// Categorize and render data
		data.recommendations.forEach((rec) => {
			let listItem = '';
			if (rec.type === 'artist') {
				listItem = `
					<li>
						<strong>${rec.artist}</strong><br>
						<em>Reason:</em> ${rec.reason}
					</li>
				`;
				artistColumn.innerHTML += listItem;
			} else if (rec.type === 'album') {
				listItem = `
					<li>
						<strong>${rec.album}</strong> by ${rec.artist2}<br>
						<em>Reason:</em> ${rec.reason}
					</li>
				`;
				albumColumn.innerHTML += listItem;
			} else if (rec.type === 'song') {
				listItem = `
					<li>
						<strong>${rec.song}</strong> by ${rec.artist2}<br>
						<em>Reason:</em> ${rec.reason}
					</li>
				`;
				songColumn.innerHTML += listItem;
			}
		});
		const done = document.querySelector("#results");
		done.innerHTML = "Done!";
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        resultsDiv.innerHTML = '<p>Failed to load recommendations.</p>';
    }
});

