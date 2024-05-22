    // Luodaan muuttujat joihin tallentuu valinta- ja hakukenttäelementti
    const theaterSelect = document.getElementById('theater-select');
    const searchInput = document.getElementById('search-input');

    // Noudetaan teatterit ja täytetään alasvetovalikko
    fetchTheaters();

    // Lisätään tapahtumakuuntelija teatterin valinnan muutokselle
    theaterSelect.addEventListener('change', function() {
        const selectedTheaterId = this.value;
        fetchMovies(selectedTheaterId);
    });

    // Lisätään tapahtumakuuntelija hakukentän muutokselle
    searchInput.addEventListener('input', function() {
        const searchString = this.value.trim();
        const selectedTheaterId = theaterSelect.value;
        fetchMovies(selectedTheaterId, searchString);
    });

    // Funktio teatterien noutamiseksi
function fetchTheaters() {
    const theatersUrl = 'https://www.finnkino.fi/xml/TheatreAreas/';
    fetch(theatersUrl)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const theaters = xmlDoc.querySelectorAll('TheatreArea');
            const theaterSelect = document.getElementById('theater-select');

            theaters.forEach(theater => {
                const option = document.createElement('option');
                option.textContent = theater.querySelector('Name').textContent;
                option.value = theater.querySelector('ID').textContent;
                theaterSelect.appendChild(option);
            });

            const selectedTheaterId = theaterSelect.value;
            fetchMovies(selectedTheaterId);
        })
        .catch(error => console.error('Error fetching theaters:', error));
}
    // Funktio elokuvien noutamiseksi
function fetchMovies(theaterId, searchString = '') {
    const moviesUrl = `https://www.finnkino.fi/xml/Schedule/?area=${theaterId}`;
    fetch(moviesUrl)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const movies = xmlDoc.querySelectorAll('Show');
            const moviesList = document.getElementById('movies-list');
            moviesList.innerHTML = '';

            movies.forEach(movie => {
                const title = movie.querySelector('Title').textContent;
                const start = formatDateTime(movie.querySelector('dttmShowStart').textContent);
                const end = formatDateTime(movie.querySelector('dttmShowEnd').textContent);
                const imageUrl = movie.querySelector('EventSmallImagePortrait').textContent;
                const description = movie.querySelector('PresentationMethodAndLanguage').textContent;

                if (!title.toLowerCase().includes(searchString.toLowerCase())) {
                    return;
                }

                const movieDiv = document.createElement('div');
                movieDiv.classList.add('movie-item');

                movieDiv.innerHTML = `
                    <h2>${title}</h2>
                    <img src="${imageUrl}" alt="${title} Image">
                    <p>Description: ${description}</p>
                    <p>Start: ${start} - End: ${end}</p>
                `;
                moviesList.appendChild(movieDiv);
            });
        })
        .catch(error => console.error('Error fetching movies:', error));
}
    // Funktio jossa aika ja päivämäärä muotoillaan luettavaan muotoon
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    const hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
    const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    const formattedTime = `${hours}:${minutes}`;
    return `${formattedDate} ${formattedTime}`;
}
