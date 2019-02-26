// CHATBOT js

// Memakai express untuk membangun server!
const express = require('express');
// Memakai bodyParser untuk membaca dan memilah request-request yang akan diterima!
const bodyParser = require('body-parser');
// Memakai http untuk melakukan pemanggilan HTTP ke API untuk mengambil data
const http = require('http');
// Mendapatkan Api key dari OMDb API yang tersimpan di folder apiKey 
const API_KEY = require('./apiKey');
// Untuk mengakses genre database dari TMDb
const fetch = require('node-fetch');
// Apikey untuk TMDb:
var apiKey='89f39cc12fe8e1e7b6c5e0d8d315c609';
// Request API TMDb untuk recommendation
var movieRecommendation = 'https://api.themoviedb.org/3/discover/movie?api_key='+apiKey+'&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=';

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
        const targetTitle = req.body.result && req.body.result.parameters && req.body.result.parameters.movie ? req.body.result.parameters.movie : '';
        // Request Url dari OMDb API
        const reqUrl = encodeURI(`http://www.omdbapi.com/?t=${targetTitle}&apikey=${API_KEY}`);
        http.get(reqUrl, (responseFromAPI) => {
            let fullResponse = ''; // Diisi hasil query dari OMDb.
            responseFromAPI.on('data', (chunk) => {
                fullResponse += chunk;
            });
            responseFromAPI.on('end', () => {
                const movie = JSON.parse(fullResponse);
                let moviedetails = '';
                let op = 0;
                // Kode spesial request jika ingin mintanya recommendation dan bukan movie search
                if (targetTitle.charAt(0)=="G" && targetTitle.charAt(1)=="N" && targetTitle.charAt(2)=="R"){
                    // op = 1 menandakan operasi recommendation
                    op=1;
                    const res2 = (targetTitle.substring(3)).toLowerCase();
                    let id;
                    //matching ID dengan genre dari TMDb
                    switch(res2) {
                    case "comedy":
                    id = 35;
                    break;
                    case "action":
                    id = 28;
                    break;
                    case "adventure":
                    id = 12;
                    break;
                    case "animation":
                    id = 16;
                    break;
                    case "crime":
                    id = 80;
                    break;
                    case "documentary":
                    id = 99;
                    break;
                    case "drama":
                    id = 18;
                    break;
                    case "family":
                    id = 10751;
                    break;
                    case "fantasy":
                    id = 14;
                    break;
                    case "history":
                    id = 36;
                    break;
                    case "horror":
                    id = 27;
                    break;
                    case "music":
                    id = 10402;
                    break;
                    case "mystery":
                    id = 9648;
                    break;
                    case "romance":
                    id = 10749;
                    break;
                    case "science fiction":
                    id = 878;
                    break;
                    case "tv movie":
                    id = 10770;
                    break;
                    case "thriller":
                    id = 53;
                    break;
                    case "war":
                    id = 10752;
                    break;
                    case "western":
                    id = 37;
                    break;
                    default:
                    // ERROR : Id not found default val
                    id = 'XXX';
                    }
    
                    if(id!='XXX'){
                        //kirim request API ke TMDb dan simpan hasil query.
                        // Fetch bersifat asynchronous sehingga harus ditunggu promise value yang akan direturn
                        fetch(movieRecommendation+id)
                        .then(res => res.json())
                        .then(json =>{
                            max =json.results.length-1;
                            min = 0;
                            var randompick = Math.floor(Math.random() * (max-min+1))+min; 
                            //DEBUGGING:
                                //console.log(randompick)
                                //console.log(xjson.results[0].original_title);
                                //console.log(moviedetails);
                            moviedetails += `Title:\n${json.results[randompick].original_title}`;
                            moviedetails += `\n\nSynopsis:\n${json.results[randompick].overview}`;
                            
                            moviedetails += `\n\nPoster:\nhttp://image.tmdb.org/t/p/w500${json.results[randompick].poster_path}`;
                            return res.json({
                                speech: moviedetails,
                                displayText: moviedetails,
                                source: 'get-movie-details'
                            });
                        });
                    }
                    else
                        moviedetails += `WARNING: Movie Not Found. Use proper capitalizations and DON'T TYPO YOU HOOMAN!!!`;
                }
                // Jika tidak diterima parameter query apa-apa a.k.a. gagal intent dari bot dialogflow
                else if (targetTitle == '' && op == 0)
                    // Beri warning!
                    moviedetails +=`WARNING: Movie Not Found. Use proper capitalizations and DON'T TYPO YOU HOOMAN!!!`;
                else
                    // Else: isi dengan data dari movie yang telah di-search.
                    moviedetails += `${movie.Title}\n\nRatings: ${movie.Rated}\nIMDB Rating: ${movie.imdbRating}\nBox Office: ${movie.BoxOffice}\nRelease Date: ${movie.Released}\n\nStarring: ${movie.Actors}\n\nType: ${movie.Type}\nGenres: ${movie.Genre}\nRuntime: ${movie.Runtime}\n\nDirector: ${movie.Director}\nWriter: ${movie.Writer}\n\nLanguages Available: ${movie.Language}\nCountry : ${movie.Country}\n\nSynopsis: ${movie.Plot}\n\nAwards won: ${movie.Awards}\nPoster: \n${movie.Poster}` ;
    
                //Return ke agent dialogflow
                if (op==0){
                    return res.json({
                        speech: moviedetails,
                        displayText: moviedetails,
                        source: 'get-movie-details'
                    });
                }
            });
        }, (error) => {
            return res.json({
                speech: 'Error woy! Hati-hati dong! :o',
                displayText: 'Error woy! Hati-hati dong!  :o',
                source: 'get-movie-details'
            });
        });
    });

// Untuk testing di localhost port 8000
server.listen((process.env.PORT || 8000), () => {
    console.log("Server berjalan dengan lancar");
});