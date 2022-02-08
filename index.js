const axios = require("axios");
const FormData = require("form-data");

const form = new FormData();
// Second argument  can take Buffer or Stream (lazily read during the request) too.
// Third argument is filename if you want to simulate a file upload. Otherwise omit.
form.append("field", "a,b,c", "data.csv");
axios
  .post("http://example.org/endpoint", form, {
    headers: form.getHeaders(),
  })
  .then((result) => {
    // Handle result…
    console.log(result.data);
  });

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION😫");
  server.close(() => {
    process.exit(1);
  });
});
