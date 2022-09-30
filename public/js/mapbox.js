

export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2lwdW44MzQiLCJhIjoiY2w4MW9kb3JmMGh1ejNydDlxemUyNzNnNCJ9.b3cnvAuHA_baKPt8ZwMuWQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/sipun834/cl81vp825007q14pmc4eohld0', // this is the link from the studio
        scrollZoom: false// this option is for making scrolling disable
        
    } );

    const bounds = new mapboxgl.LngLatBounds(); // bounds are used for fitting the map to certain location

    locations.forEach(loc => {
        //create a new element with class name marker
        const el = document.createElement('div')
        el.className = 'marker'
        

        // add above as Marker
        new mapboxgl.Marker( {
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map)


        //for popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates)
        .setHTML('<p>Day '+loc.day+': ' +loc.description + '</p>')
        .addTo(map)


        // add the loc to the bounds
        //extends the map bounds to include current location
        bounds.extend(loc.coordinates )
    });

    /// zoom out /in feature editing and actaully exexute the options made
    // above
    map.fitBounds(bounds , {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    })
}