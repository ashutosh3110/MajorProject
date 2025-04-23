/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
// [START maps_add_map]
// Initialize and add the map

let map;

async function initMap() {
  // [START maps_add_map_instantiate_map]
  // The location of Uluru
  const position = window.coordinates;
  const location=window.foundListing.location;
  console.log("Coordinates passed to map:", position);

  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered at Uluru
  const map = new Map(document.getElementById("map"), {
    zoom: 3,
    center: position,
    mapId: "DEMO_MAP_ID",
  });
  

  // [END maps_add_map_instantiate_map]
  // [START maps_add_map_instantiate_marker]
  // The marker, positioned at Uluru
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    draggable: true,
    //  title:`<h4>${location}</h4>`,
  });
  // [END maps_add_map_instantiate_marker]

const infoWindow = new google.maps.InfoWindow({
  content: `<h4>${location}</h4>`,
});
marker.addListener("click", () => {
  infoWindow.open(map, marker);
});
}

window.initMap = initMap;
// [END maps_add_map]