// jshint esversion : 6

const express = require("express");
const bodyParser = require("body-parser");
const { type } = require("os");
const { receiveMessageOnPort } = require("worker_threads");
const http = require("https");

const app = express();

const port = 3000;
const serverMessage = () => {
    console.log(`Server is running successfully on Port:${port}`);
}

app.set('view engine', 'ejs');
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.render("home")
})

app.post("/result", (req, res) => {
    const job_name = req.body.job_type;
    const job_place = req.body.job_location;
    const api_key = "16aaea2ce4c9ce041336c13bf9fb40cccad46c06f64d021c2928fd88bab49668";

    const url = `https://serpapi.com/search.json?api_key=${api_key}&engine=google_jobs&q=${job_name}&hl=en&location=${job_place}`;

    http.get(url, (response) => {
        const chunks = [];
        response.on('data', (data) => {
            chunks.push(data);
        });

        response.on("end", () => {
            const data = Buffer.concat(chunks);
            const realdata = JSON.parse(data);
            const jobResults = [];

            for (var i = 0; i < realdata.jobs_results.length; i++) {
                var job_title = realdata.jobs_results[i].title;
                var job_provider = realdata.jobs_results[i].company_name;
                var job_location = realdata.jobs_results[i].location;
                var job_offer_by = realdata.jobs_results[i].via;
                var job_type = realdata.jobs_results[i].detected_extensions.schedule_type;

                jobResults.push({
                    job_title_ejs: job_title,
                    job_provider_ejs: job_provider,
                    job_location_ejs: job_location,
                    job_offer_by_ejs: job_offer_by,
                    job_type_ejs: job_type,
                });
            }

            res.render(`result`, {
                jobResults: jobResults, // Pass the array of job results to the template
            });
        });
    });
});


app.listen(port, serverMessage);