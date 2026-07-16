const fetch = require('node-fetch');
async function run() {
  const url = "https://services-eu1.arcgis.com/N71XNn5jV2Z0tHjM/arcgis/rest/services/Storm_Discharge_Live_Alerts_Production_1_2/FeatureServer/0/query?f=json&where=1=1&outFields=*&returnGeometry=true";
  const res = await fetch(url);
  const data = await res.json();
  const features = data.features;
  const cassington = features.find(f => f.attributes.LocationName && f.attributes.LocationName.toLowerCase().includes('cass'));
  if (cassington) {
    console.log("FOUND CASSINGTON!");
    console.log(cassington.attributes);
    console.log(cassington.geometry);
  } else {
    console.log("CASSINGTON NOT FOUND IN THAMES WATER API!");
  }
}
run();
