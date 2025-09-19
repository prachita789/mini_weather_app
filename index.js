

//https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}


const api_key = `5128a0a08aa9659e5f3dccddc81954b1`

function getData(){
    let city = document.getElementById("city").value;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`;

fetch(url)
.then(function (res) {
    return res.json();
})
.then(function (res) {
    append(res)
    console.log(res);
})
.catch(function (err) {
   console.log("err:" , err);
});

}

function getDataLocation(lat,lon){
    const url =`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=5128a0a08aa9659e5f3dccddc81954b1`;

    fetch(url)
.then(function (res) {
    return res.json();
})
.then(function (res) {
    append(res)
    console.log(res);
    
})
.catch(function (err) {
   console.log("err:" , err);
});

}

function getDailyData(lat,log){
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${log}&exclude{part}&appid=5128a0a08aa9659e5f3dccddc81954b1`
    
    fetch(url)
    .then(function (res){
        return res.json();
    })
    .then(function(res){
        appendDaily(res)
        console.log(res);
    })
}

function appendDaily(data){
    let container = document.getElementById("box");
    document.querySelector("#box").innerHTML =null ;
    let i=0 ;

     data.daily.map(function(elem){

        if(i==0){

        }
        else
        {
            let box2 = document.createElement("div")

            // let day = document.createElement("h3")
            let day = document.createElement("p");
            const time = elem.dt;
            const date = new Date(time * 1000);
            day.innerText = `Date : ${date.toLocaleDateString("en-US")}`;

         
         
            let img = document.createElement("img")
            img.setAttribute("id","image")
            img.src =  
            ` https://openweathermap.org/img/wn/${elem.weather[0].icon}@2x.png`         
            
            let max = document.createElement("p")
            max.innerText = `Max: ${Math.round(elem.temp.max - 273)} °C`
         
            let min = document.createElement("p")
            min.innerText = `Min: ${Math.round(elem.temp.min - 273)} °C`
         
            box2.append(day,img,max,min)

            container.append(box2)
        
          
        }
        i++;
    })

}



function append(data){
    let container = document.getElementById("container");

    let map =document.getElementById("gmap_canvas");
    container.innerText = null; 
    
    let divM = document.createElement("div");
    divM.setAttribute("id","divM");
    
    let city = document.createElement("p");
    city.innerText = `City: ${data.name}`;
     
    let min = document.createElement("p");
    min.innerText = `Min temp: ${Math.round(data.main.temp_min - 273)} °C`;

    let max = document.createElement("p");
    max.innerText = `Max temp:${Math.round(data.main.temp_max - 273)} °C`;

    let current = document.createElement("p");
    current.innerText = `Temperature: ${Math.round(data.main.temp - 273)} °C`;

    let humidity  = document.createElement("p");
    humidity.innerText = `Humidity: ${data.main.humidity}%`;

    let wind  = document.createElement("p");
    wind.innerText = `Wind: ${data.wind.speed}km/h`;

    // let clounds =  document.createElement("p");
    // clounds.innerText = `Clounds: ${data.clouds.all}`;

    // let sunrise =  document.createElement("p");
    // sunrise.innerText = `Sunrise: ${data.sys.sunrise}`;

    // let sunset =  document.createElement("p");
    // sunset.innerText = `Sunset: ${data.sys.sunset}`;

    divM.append(city,min,max,current,humidity,wind);
    container.append(divM,map);
    map.src = `https://maps.google.com/maps?q=${data.name}&t=&z=13&ie=UTF8&iwloc=&output=embed `

}


    
function getWeather(){
navigator.geolocation.getCurrentPosition(success);

function success(position) {
    var crd = position.coords;
  
    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    getDataLocation(crd.latitude, crd.longitude);

    getDailyData(crd.latitude,crd.longitude)
}
}
  

