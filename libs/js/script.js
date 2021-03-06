// modal
const details = document.getElementById("myModal");
const virus = document.getElementById("virus");
const news = document.getElementById("news");
const weather = document.getElementById("weather");
const images = document.getElementById("images");
const currency = document.getElementById("currency");


const btn = document.getElementById("myBtn");
const span = document.getElementsByClassName("close");

let map = L.map('map');
let border;
let markers;
let countryObjects = new L.FeatureGroup();

const markerIcon = L.ExtraMarkers.icon({
  // iconUrl: './favicon/favicon.ico',
  // iconSize: [20, 20]

  shape: 'circle',
  markerColor: 'violet',
  prefix: 'fas',
  icon: 'fa-city',
  iconColor: '#fff',
  svg: false
});

const windDirection = degree => {

  switch (true) {
    case degree === 0:
    case degree === 360:
      return 'E';
    case degree === 270:
      return 'S';
    case degree === 180:
      return 'W';
    case degree === 90:
      return 'N';
    case (degree > 0 && degree < 90):
      return 'NE';
    case (degree > 90 && degree < 180):
      return 'NW';
    case (degree > 180 && degree < 270):
      return 'SW';
    case (degree > 270 && degree < 360):
      return 'SE';
  }
}



const roundData = data => {
  let num = Math.abs(Number(data));

  if (num >= 1.e+6) {
    return (num / 1.e+6).toFixed(2) + ' M';
  } else if (num >= 1.e+3) {
    return (num / 1.e+3).toFixed(2) + ' K';
  }
  return num;

};

const getCities = () => {

  $.ajax({
    url: 'libs/php/cities.php',
    type: 'POST',
    dataType: 'json',
    data: {
      north: $('#north').text(),
      south: $('#south').text(),
      east: $('#east').text(),
      west: $('#west').text()
    },
    success: function (result) {


      const data = result.data.geonames


      if (result.status.name == 'ok') {

        for (let i = 0; i < 20; i++) {

          try {
            if (data[i].countrycode == $('#countrySelect').val() && data[i].population >= 5.e+5) {
              map.addLayer(countryObjects);



              const marker = L.marker([data[i].lat, data[i].lng], { icon: markerIcon }).bindPopup(
                `<h3 style="font-size: 1.2rem;">${data[i].name}</h3>
                <table>
                  <tr>
                    <td>Population:</td>
                    <td class="pl-2">${roundData(data[i].population)}</td>
                  </tr>
                </table>
                <p><a href="https://${data[i].wikipedia}" target="_blank">wikipedia</a></p>`
              ).addTo(countryObjects);
            }

          } catch (e) {

            map.addLayer(countryObjects);

            const marker = L.marker(map.getCenter(border), { icon: markerIcon }).bindPopup(
              `<h3 style="font-size: 1.2rem;">${$('#countrySelect option:selected').text()}</h3>
              <p>No data available</p>`
            ).addTo(countryObjects);
          }

        }




      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // your error code
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    }
  }).then(() => $('#loader').fadeOut('slow'));
}

const countryInfo = () => {
  $.ajax({
    url: 'libs/php/getCountryInfo.php',
    type: 'POST',
    dataType: 'json',
    data: {
      country: $('#countrySelect').val()
    },
    success: function (result) {



      if (result.status.name == 'ok') {
        $('#flag').attr('src', `https://www.countryflags.io/${$('#countrySelect').val()}/flat/64.png`);
        $('#txtCountry').html(result.data[0].countryName);
        $('#txtCapital').html(result.data[0].capital);
        $('#txtPop').html(roundData(result.data[0].population));
        $('#txtCurrency').html(result.data[0].currencyCode);
        $('#wiki').attr('href', `https://en.wikipedia.org/wiki/${$('#countrySelect option:selected').text()}`);

        $('#north').html(result.data[0].north);
        $('#south').html(result.data[0].south);
        $('#east').html(result.data[0].east);
        $('#west').html(result.data[0].west);



      }
    }
  }).then(getCities)
};



btn.onclick = function () {
  details.style.display = "block";
};

$('.close').click(function () {
  details.style.display = "none";
});

window.onclick = function (event) {
  if (event.target == details) {
    details.style.display = "none";
  };
};






const gotPos = position => {
  let lat = position.coords.latitude;
  let lng = position.coords.longitude;

  $(window).ready(function () {
    $('#loader').fadeOut('slow');

    $.ajax({
      url: 'libs/php/initPosition.php',
      type: 'POST',
      dataType: 'json',
      data: {
        lat: lat,
        lng: lng
      },
      success: function (result) {


        if (result.status.name == 'ok') {
          $('#countrySelect').val(result.data.countryCode);
          $('#countrySelect').trigger('change');


        }
      }
    }).then(countryInfo)
  });

  map.setView([lat, lng], 5)

  const OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

};


const fail = err => {
  let errors = {
    1: 'no permission',
    2: 'unable to determine',
    3: 'took too long'
  };
  console.log(errors[err]);
};

if (navigator.geolocation) {
  let giveUp = 1000 * 30;
  let tooOld = 1000 * 60 * 5;
  let options = {
    enableHighAccuracy: true,
    timeout: giveUp,
    maximumAge: tooOld
  }
  navigator.geolocation.getCurrentPosition(gotPos, fail, options);
}




$(document).ready(function () {




  $(window).ready(function () {


    $.ajax({
      url: 'libs/php/countryBorder.php',
      type: 'POST',
      dataType: 'json',

      success: function (result) {



        $('#countrySelect').html('');

        $.each(result.data, function (index) {

          $('#countrySelect').append($('<option>', {
            value: result.data[index].code,
            text: result.data[index].name
          }));
        });
        // NAVIGATOR 


      },
      error: function (jqXHR, textStatus, errorThrown) {
        // your error code
        console.log(errorThrown);
        console.log(textStatus);
        console.log(jqXHR);
      }
    })
  })

  $('#countrySelect').change(function () {
    $('#loader').show();
    $.ajax({
      url: 'libs/php/borders.php',
      type: 'POST',
      dataType: 'json',
      data: {
        country: $('#countrySelect').val()

      },
      success: function (result) {

        const polystyle = () => {
          return {
            fillColor: '#3b7a4c',
            weight: 1,
            opacity: 1,
            color: '#3b7a4c',
            fillOpacity: 0.2
          };
        }

        if (result.status.name == 'ok') {
          countryObjects.eachLayer(function (layer) {
            countryObjects.removeLayer(layer);
          });
          border = L.geoJSON(result.data, { style: polystyle }).addTo(countryObjects);
          map.fitBounds(border.getBounds());
        }


      },
      error: function (jqXHR, textStatus, errorThrown) {
        // your error code
        console.log(errorThrown);
        console.log(textStatus);
        console.log(jqXHR);
      }
    }).then(countryInfo);

  })

  //covid easybutton
  L.easyButton('fa-virus', function () {
    virus.style.display = "block";

    $('.close').click(function () {
      virus.style.display = "none";
    });

    window.onclick = function (event) {
      if (event.target == virus) {
        virus.style.display = "none";
      };
    };

    $.ajax({
      url: 'libs/php/covid.php',
      type: 'POST',
      dataType: 'json',
      data: {
        country: $('#countrySelect option:selected').text()
      },
      success: function (result) {

        let data = result.data;
        let covid = data.pop();

        if (result.status.name == 'ok') {
          $('#txtConfirmed').html(roundData(covid.Confirmed));
          $('#txtActive').html(roundData(covid.Active));
          $('#txtRecovered').html(roundData(covid.Recovered));
          $('#txtDeaths').html(roundData(covid.Deaths));
        }
      }
    });
  }).addTo(map);

  L.easyButton('fa-newspaper', function () {
    news.style.display = "block";

    $('.close').click(function () {
      news.style.display = "none";
    });

    window.onclick = function (event) {
      if (event.target == news) {
        news.style.display = "none";
      };
    };

    $.ajax({
      url: 'libs/php/news.php',
      type: 'POST',
      dataType: 'json',
      data: {
        country: $('#countrySelect').val()
      },
      success: function (result) {
        console.log(result)
        const data = result.data.articles;


        if (result.status.name == 'ok') {

          let tbl = $('#newsList').html('');

          if (data.length == 0) {
            $(tbl).before('<p>no news available for this country</p>');
          }

          $.each(data, function (index) {
            if (data[index].urlToImage) {
              let tRows = `
            <tr class="d-flex flex-wrap mb-3 flex-md-nowrap">
              <td class="col-12 col-md-4 px-0 pr-md-2"><img src="${data[index].urlToImage}"></td>
              <td >${data[index].title} - <a href="${data[index].url}" target="_blank">See article</a></td>
            </tr>`;
              $(tbl).append(tRows);
            }


          });

        }
      }
    });
  }).addTo(map);

  L.easyButton('fa-cloud-sun-rain', function () {
    weather.style.display = "block";

    $('.close').click(function () {
      weather.style.display = "none";
    });

    window.onclick = function (event) {
      if (event.target == weather) {
        weather.style.display = "none";
      };
    };

    $.ajax({
      url: 'libs/php/getWeather.php',
      type: 'POST',
      dataType: 'json',
      data: {
        city: $('#countrySelect option:selected').text()
      },
      success: function (result) {



        const icon = result.data.weather[0].icon;
        const data = result.data

        if (result.status.name == 'ok') {
          $('#weatherIcon').attr('src', `https://openweathermap.org/img/wn/${icon}.png`);
          $('#txtTemp').html(`${data.main.temp}°C`);
          $('#description').html(`Feels like ${data.main.feels_like}°C. ${data.weather[0].description}.`);
          $('#maxMin').html(`${data.main.temp_max} / ${data.main.temp_min}°C`);
          $('#txtWind').html(`${data.wind.speed}m/s ${windDirection(data.wind.deg)}`);
          $('#humidity').html(`Humidity: ${data.main.humidity}%`)

        }
      }
    });
  }).addTo(map);


  L.easyButton('fa-image', function () {
    images.style.display = "block";

    $('.close').click(function () {
      images.style.display = "none";
    });

    window.onclick = function (event) {
      if (event.target == images) {
        images.style.display = "none";
      };
    };


    $.ajax({
      url: 'libs/php/images.php',
      type: 'POST',
      dataType: 'json',
      data: {
        image: $('#txtCapital').text()
      },
      success: function (result) {

        if (result.status.name == 'ok') {
          $('#img1').attr('src', result.data.results[0].urls.regular);
          $('#img2').attr('src', result.data.results[1].urls.regular);
          $('#img3').attr('src', result.data.results[2].urls.regular);
          $('#imgDescription1').html(result.data.results[0].alt_description);
          $('#imgDescription2').html(result.data.results[1].alt_description);
          $('#imgDescription3').html(result.data.results[2].alt_description);

        }
      }
    });

  }).addTo(map);

  L.easyButton('fa-pound-sign', function () {
    currency.style.display = "block";

    $('.close').click(function () {
      currency.style.display = "none";
    });

    window.onclick = function (event) {
      if (event.target == currency) {
        currency.style.display = "none";
      };
    };

    $.ajax({
      url: 'libs/php/currency.php',
      type: 'POST',
      dataType: 'json',
      success: function (result) {


        const rate = Number(result.data.rates[$('#txtCurrency').text()]);

        if (result.status.name == 'ok') {

          if (isNaN(rate)) {
            $('#rate').html(': Rate not available for this currency');
          } else {
            $('#rate').html(': ' + rate.toFixed(2));

            $('#convertBtn').click(function () {
              $('#result').html(`${$('#txtCurrency').text()}: ${($('#converter').val() * rate).toFixed(2)}`);
            });
          }


        }
      }
    });




  }).addTo(map);


});
