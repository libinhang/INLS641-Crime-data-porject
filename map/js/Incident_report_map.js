class IRmap {
    constructor(container_id) {
        this.incident_url = "../data/Police_Incident_Reports_Written.csv"
        this.container_id = container_id;
        this.cata_color = d3.scaleOrdinal(d3.schemeCategory10);
        this.height = document.getElementById("Imap").getBoundingClientRect().height;
        this.width =  document.getElementById("Imap").getBoundingClientRect().width;
        // Select the SVG element for the map.
        this.svg = d3.select("#" + this.container_id);
    }

    loadAndPrepare(){
        //load incident reports data
        d3.csv(this.incident_url, d => {
            return {
                longitude: d.X,
                latitude: d.Y,
                id: d.Incident_ID,
                offense: d.Offense,
                street: d.Street,
                date_of_report: d.Date_of_Report,
                date_of_occurrence: d.Date_of_Occurrence,
                victim_age: d.Victim_Age,
                victim_race: d.Victim_Race,
                victim_gender: d.Victim_Gender,
            }
        }).then(data => {
            //process data
            // let rangeX = (d3.max(data.map(d=>d.longitude)) - d3.min(data.map(d=>d.longitude)))/20
            // let rangeY = (d3.max(data.map(d=>d.latitude)) - d3.min(data.map(d=>d.latitude)))/20
            //
            // let X_subs = [parseFloat(d3.min(data.map(d=>d.longitude)))]
            // let Y_subs = [parseFloat(d3.min(data.map(d=>d.latitude)))]
            // for(let i = 1; i<21;i++){
            //     X_subs[i] = X_subs[i-1]+ rangeX
            //
            //     Y_subs[i] = Y_subs[i-1]+ rangeY
            // }
            //
            //
            // console.log([X_subs,Y_subs])
            //
            // let n = (data.filter(d=>X_subs[1]>d.longitude>X_subs[2])).length
            // console.log(n)
            this.render(data)

        }).catch(error => {
            console.log("Error when loading or processing the CSV data.")
            console.log(error);
        })

    }

    render(data) {
        d3.json("../data/chapel_hill_all_streets.geojson", d => d).then((geo_json_data)=>{
            // Define the projection.
            this.projection = d3.geoConicConformal()
                .parallels([34 + 20 / 60, 36 + 10 / 60])
                .rotate([79, 0])
                // Fit the map to a space that is 7x the size of the SVG element. This gives
                // us a fair amount of map that is beyond the boundary for panning.
                .fitExtent([[-3 * this.width, -3 * this.height], [4 * this.width, 4 * this.height]], geo_json_data);
            // Define the path generator using the projection.
            let path = d3.geoPath().projection(this.projection);

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
                .on("mouseenter", (e,d) => {
                    d3.select("#road_name").html(d.properties.name.length > 0 ? d.properties.name : "&nbsp;");
                })
                .on("mouseout", (e,d) => {
                    d3.select("#road_name").html("&nbsp;");
                })

            //Draw heat map
            let heatmap_rollup =d3.rollup(data, group => d3.count(group, d => d.id), d => d.street);
            let heatmap_data = d3.map(heatmap_rollup,d=>d)

            // console.log(heatmap_data)

            let bubbles = this.svg.select("g").selectAll("circle").data(data, d=>d[1]);
            bubbles.join(
                enter=>enter.append("circle")
                    .attr("r", 0)
                    .attr("cx", d => this.projection([d.longitude, d.latitude])[0])
                    .attr("cy", d => this.projection([d.longitude, d.latitude])[1])
                    .style("fill", d => this.cata_color(d.charge_cat))
                    // Animate the radius to have the circles slowly grow to full size.
                    .transition()
                    .delay(600 * !bubbles.exit().empty())
                    .duration(600)
                    .style("opacity", 0.2)
                    .attr("r", 1),

                // There is no modification required for updated circles. They can remain unchanged...
                update=>update,

                exit => exit.transition().duration(600).attr("r", 0).remove()
            )
        })

        // d3.json("../data/nc-counties.json").then(map_data=>{
        //     // Get the SVG container for the visualization, and create the projection needed for the map.
        //     let nc_county_map_data = topojson.feature(map_data, map_data.objects.cb_2015_north_carolina_county_20m).features.filter(d=>d.properties.NAME=="Orange" || d.properties.NAME=="Durham" || d.properties.NAME=="Chatham");
        //     let projection = d3.geoAlbers()
        //         .rotate([79, 0])
        //         .fitSize([this.width,this.height], nc_county_map_data);
        //     console.log(nc_county_map_data)
        //     // Define the path generator using the projection.
        //     let path = d3.geoPath().projection(projection);
        //
        //     this.svg.append("g")
        //         .attr("class", "county")
        //         .selectAll("path")
        //         .data(nc_county_map_data.features, d=>d.properties.NAME)
        //         .enter().append("path")
        //         .attr("fill", "white")
        //         .attr("stroke", "black")
        //         .attr("d", path);
        // }).catch(error => {
        //     console.log("Error when loading or processing the CSV data.")
        //     console.log(error);
        // })

    }
}