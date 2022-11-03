class AMmap {
    constructor(container_id) {
        this.arrest_url = "../data/clean_ch_arrests.csv";
        this.container_id = container_id
        this.loadAndPrepare()
        this.map_render();
        this.height = 500;
        this.width = 1500;
        // Select the SVG element for the map.
        this.svg = d3.select("#" + this.container_id);
    }

    loadAndPrepare(_subs){
        // Load arrest made data.
       d3.csv(this.arrest_url, d => {
            return {
                longitude: d.X,
                latitude: d.Y,
                id: d.Incident_Id,
                charges: d.Primary_Charge,
                charge_cat: d.Category,
                street: d.Street,
                city: d.City,
                date: d.Date_of_Arrest,
                age: d.Age,
                race: d.Race,
                gender: d.Gender,
                ethnicity: d.Ethnicity,
                type: d.Type_of_Arrest,
                drug_or_alcohol: d.Drugs_or_Alcohol_Present,
            }
        }).then(data => {
            //process data
            let min_longitude = d3.min(data, d=>d.longitude);
            let min_latitude = d3.min(data, d=>d.latitude);
            let max_longitude = d3.max(data, d=>d.longitude);
            let max_latitude = d3.max(data, d=>d.latitude);

           //filtering data
            let data_subs = data
            if(_subs!="All"){
                data_subs = data.filter(d=>d.charge_cat == _subs)
            }
            this.render(data_subs)
            this.map_render(min_longitude,min_latitude,max_longitude,max_latitude)
        }).catch(error => {
            console.log("Error when loading or processing the CSV data.")
            console.log(error);
        })
    }

    map_render(min_longitude,min_latitude,max_longitude,max_latitude){
        //set up x and y
        this.x = d3.scaleLinear()
            .domain([min_longitude, max_longitude])
            .range([0,this.height]);
        this.y = d3.scaleLinear()
            .domain([min_latitude, max_latitude])
            .range([0, this.height]);

        // load map
        d3.json("../data/chapel_hill_all_streets.geojson", d => d).then(geo_json_data => {
            // Define the projection.
            let projection = d3.geoConicConformal()
                .parallels([34 + 20 / 60, 36 + 10 / 60])
                .rotate([79, 0])
                // Fit the map to a space that is 7x the size of the SVG element. This gives
                // us a fair amount of map that is beyond the boundary for panning.
                .fitExtent([[-3 * this.width, -3 * this.height], [4 * this.width, 4 * this.height]], geo_json_data);

            // Define the path generator using the projection.
            let path = d3.geoPath().projection(projection);

            // Create a zoom control for the map and attach it to the svg eleent.
            const zoom = d3.zoom()
                .scaleExtent([0.3, 7])
                .on('zoom', (e, d) => {
                    this.svg.select('g')
                        .attr('transform', e.transform);
                });
            this.svg.call(zoom);

            // Draw the street map.
            this.svg.append("g").selectAll("path")
                .data(geo_json_data.features, d => d.properties.name).join("path")
                .attr("class", d => {
                    if (d.properties.highway == "residential") {
                        return "way residential";
                    } else if (d.properties.highway == "tertiary") {
                        return "way tertiary";
                    } else if (d.properties.highway == "secondary") {
                        return "way secondary";
                    } else if (d.properties.highway == "primary") {
                        return "way primary";
                    } else if (d.properties.highway == "trunk") {
                        return "way trunk";
                    } else if (d.properties.highway == "motorway") {
                        return "way motorway";
                    } else {
                        return "way link";
                    }
                })
                .attr("d", path)
                .on("mouseenter", (e, d) => {
                    d3.select("#road_name").html(d.properties.name.length > 0 ? d.properties.name : "&nbsp;");
                })
                .on("mouseout", (e, d) => {
                        d3.select("#road_name").html("&nbsp;");
                    }
                )
        })
    }

    render(data_subs) {
       console.log(data_subs)
    }
}