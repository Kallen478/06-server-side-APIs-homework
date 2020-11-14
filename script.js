var apiKey = "af3e2342decf8120edd7a8e2be7e1dbc";
var city = $("#cityInput").val();
var date = new Date();

$("#cityInput").keypress(function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        $("#searchButton").click();
    }
});

function cityList() {
    var listItem = $("<li>").addClass("list-group-item").text(city);
    $(".list").append(listItem);
}

$("#searchButton").on("click", function () {
    city = $("#cityInput").val();
    // clears the input field
    $("#cityInput").val("");

    $.ajax({
        url: "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey,
        method: "GET"
    })
        .then(function (data) {
            getCurrentWeather(data);
            getFiveDayForecast(data);
            cityList();
        })
});

function getCurrentWeather(data) {
    $('#currentWeather').empty();

    var card = $("<div>").addClass("card");
    var cardBody = $("<div>").addClass("card-body");
    var city = $("<h4>").addClass("card-title").text(data.name);
    var currentDate = $("<h4>").addClass("card-title").text(new Date().toLocaleDateString());
    // variable to convert the current temp to fahrenheit 
    var tempF = Math.floor((data.main.temp - 273.15) * 1.80 + 32);
    var currentTemp = $("<p>").addClass("card-text").text("Temperature: " + tempF + "°F");
    var currentHumidity = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
    var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
    var image = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
    var latitude = data.coord.lat;
    var longitude = data.coord.lon;

    // checks the UV index
    $.ajax({
        url: "http://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey,
        method: "GET"
    })
        // color codes UV index based on severity
        .then(function (data) {
            var uvIndex = data.value;
            var indexColor;
            if (uvIndex <= 2) {
                indexColor = "green";
            }
            else if ((uvIndex > 2) && (uvIndex <= 5)) {
                indexColor = "yellow";
            }
            else if ((uvIndex > 5) && (uvIndex <= 7)) {
                indexColor = "orange";
            }
            else {
                indexColor = "red";
            }
            var uvValue = $("<p>").attr("class", "card-text").text("UV Index: ");
            uvValue.append($("<span>").attr("style", ("background-color:" + indexColor)).text(uvIndex));
            cardBody.append(uvValue);
        });

    city.append(currentDate, image)
    cardBody.append(city, currentTemp, currentHumidity, wind);
    card.append(cardBody);
    $("#currentWeather").append(card)
}

function getFiveDayForecast() {

    $.ajax({
        url: "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + apiKey,
        method: "GET"
    })
        .then(function (data) {
            $('#fiveDayForecast').empty();

            // loop to get multi day weather info
            for (var i = 0; i < data.list.length; i++) {

                if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {

                    var card = $("<div>").addClass("card col-md-2 ml-2 bg-primary text-white");
                    var cardBody = $("<div>").addClass("card-body p-2")
                    var forecastDate = $("<h4>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
                    var forecastTempF = Math.floor((data.list[i].main.temp - 273.15) * 1.80 + 32);
                    var forecastTemperature = $("<p>").addClass("card-text").text("Temperature: " + forecastTempF + "°F");
                    var forecastHumidity = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
                    var image = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png")

                    cardBody.append(forecastDate, image, forecastTemperature, forecastHumidity);
                    card.append(cardBody);
                    $("#fiveDayForecast").append(card);
                }
            }
        });
}