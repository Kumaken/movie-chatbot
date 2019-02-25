// Memakai express untuk membangun server!
const express = require('express');
// Memakai bodyParser untuk membaca dan memilah request-request yang akan diterima!
const bodyParser = require('body-parser');
// Memakai http untuk melakukan pemanggilan HTTP ke API untuk mengambil data
const http = require('http');
// Mendapatkan Api key dari OMDb API yang tersimpan di folder apiKey 
const API_KEY = require('./apiKey');

//Membuat server express:
const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));
//Parsing:
server.use(bodyParser.json());
// Route untuk POST request:
server.post('/get-movie-details', (req, res) => {
    // Akan diparse nama movie dari request body:
    const targetTitle = req.body.result && req.body.result.parameters && req.body.result.parameters.movie ? req.body.result.parameters.movie : 'The Godfather';
    const reqUrl = encodeURI(`http://www.omdbapi.com/?t=${targetTitle}&apikey=${API_KEY}`);
    http.get(reqUrl, (responseFromAPI) => {
        let fullResponse = '';
        responseFromAPI.on('data', (chunk) => {
            fullResponse += chunk;
        });
        responseFromAPI.on('end', () => {
            const movie = JSON.parse(fullResponse);
            let moviedetails = targetTitle === 'Dora The Explorer' ? `!!!Movie Not Found. Searching your secret favourite movie instead.!!!\n\n\n` : '';
            moviedetails += `${movie.Title}\n\nRatings: ${movie.Rated}\nIMDB Rating: ${movie.imdbRating}\nBox Office: ${movie.BoxOffice}\nRelease Date: ${movie.Released}\n\nStarring: ${movie.Actors}\n\nType: ${movie.Type}\nGenres: ${movie.Genre}\nRuntime: ${movie.Runtime}\n\nDirector: ${movie.Director}\nWriter: ${movie.Writer}\n\nLanguages Available: ${movie.Language}\nCountry : ${movie.Country}\n\nSynopsis: ${movie.Plot}\n\nAwards won: ${movie.Awards}\nPoster: \n${movie.Poster}` ;

            return res.json({
                speech: moviedetails,
                displayText: moviedetails,
                source: 'get-movie-details'
            });
        });
    }, (error) => {
        return res.json({
            speech: 'Error woy! Hati-hati dong! :o',
            displayText: 'Error woy! Hati-hati dong!  :o',
            source: 'get-movie-details'
        });
    });
});

server.listen((process.env.PORT || 8000), () => {
    console.log("Server berjalan dengan lancar");
});