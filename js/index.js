const API_BASE_URL = "http://localhost:3000";

let map;
let infoWindow;
var markers = [];

function initMap() {
  let losAngeles = { lat: 34.06338, lng: -118.35808 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: losAngeles,
    zoom: 8
  });
  infoWindow = new google.maps.InfoWindow();
}

const onEnter = (e) => {
  if (e.key = "Enter") {
    getStores();
  }
}

const getStores = () => {
  const zipCode = document.querySelector("#zip-code").value;
  const API_URL = "http://localhost:3000/api/stores";
  const fullUrl = `${API_URL}?zip_code=${zipCode}`;
  fetch(fullUrl, {
    method: "GET"
  })
    .then(response => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    })
    .then(data => {
      if (data.length > 0) {
        clearLocations();
        searchLocationsNear(data);
        setStoresList(data);
        setOnClickListener();
      } else {
        clearLocations();
        noStoresFound();
      }
    });
};

const clearLocations = () => {
  infoWindow.close();
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers.length = 0;
};

const noStoresFound = () => {
  const html = `
    <div class="no-stores-found">
      No stores found 
    </div>
  `;

  document.querySelector(".stores-list").innerHTML = html;
}

const setOnClickListener = () => {
  let storeElements = document.querySelectorAll(".store-container");
  storeElements.forEach((elem, index) => {
    elem.addEventListener("click", () => {
      console.log(index);
      google.maps.event.trigger(markers[index], "click");
    });
  });
};

const setStoresList = stores => {
  let storesHTML = "";
  stores.forEach((store, index) => {
    storesHTML += `
    <div class="store-container" id="store-container">
      <div class="store-container-background">
        <div class="store-info-container">
          <div class="store-address">
            <span>${store.addressLines[0]}</span>
            <span>${store.addressLines[1]}</span>
          </div>
          <div class="store-phone-number">
              ${store.phoneNumber}
          </div>
        </div>
        <div class="store-number-container">
            <div class="store-number">
                ${index + 1}
            </div>
        </div>
      </div>
    </div>
    `;
    document.querySelector(".stores-list").innerHTML = storesHTML;
  });
};

const searchLocationsNear = stores => {
  let bounds = new google.maps.LatLngBounds();

  stores.forEach((store, index) => {
    let latlng = new google.maps.LatLng(
      store.location.coordinates[1],
      store.location.coordinates[0]
    );
    let name = store.storeName;
    let address = store.addressLines[0];
    let phone = store.phoneNumber;
    let openStatusText = store.openStatusText;
    createMarker(latlng, name, address, phone, openStatusText, index + 1);
    bounds.extend(latlng);
  });
  map.fitBounds(bounds);
};

const createMarker = (
  latlng,
  name,
  address,
  phone,
  openStatusText,
  storeNumber
) => {
  let html = `
    <div class="store-info-window">
      <div class="store-info-name">
        ${name}
      </div>
      <div class="store-info-open-status">
        ${openStatusText}
      </div>
      <div class="store-info-address">
        <div class="icon">
          <i class="fas fa-location-arrow"></i>
        </div>
        <span>
          ${address}
        </span>
      </div>
      <div class="store-info-phone">
        <div class="icon">
          <i class="fas fa-phone-alt"></i>
        </div>
          <span>
           <a href="tel:${phone}">${phone}</a>
          </span>
      </div>
    </div>
  `;
  let marker = new google.maps.Marker({
    position: latlng,
    map: map,
    label: `${storeNumber}`
  });
  google.maps.event.addListener(marker, "click", function() {
    infoWindow.setContent(html);
    infoWindow.open(map, marker);
  });
  markers.push(marker);
};
