class IRmap {
    constructor(container_id) {
        this.incident_url = "../data/Police_Incident_Reports_Written.csv"
        this.container_id = container_id;
        this.cata_color = d3.scaleOrdinal(d3.schemeCategory10);
        this.height = 500;
        this.width = 800;
        this.loadAndPrepare()
        // Select the SVG element for the map.
        this.svg = d3.select("#" + this.container_id);
    }

    loadAndPrepare() {
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
            this.render(data)
        }).catch(error => {
            console.log("Error when loading or processing the CSV data.")
            console.log(error);
        })
    }

    render(data) {
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

            //drawing colormap
            // let colormap = d3.scaleLinear().domain([0,]).range(["silver", "red"]);

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
            let circles = this.svg.select("g").selectAll("circle").data(data, d => d.id);
            circles.join(
                enter => enter.append("circle")
                    .attr("r", 0)
                    .attr("cx", d => projection([d.longitude,d.latitude])[0])
                    .attr("cy", d => projection([d.longitude,d.latitude])[1])
                    .style("fill", d => this.cata_color(d.charge_cat))
                    .on("mouseover", (e, d) => document.getElementById("description").innerHTML = "Arrest " + d.id + " happened in " +
                        d.street + " and the charge of it is " + d.charges + ". The suspect is a " + d.age + " years old " + d.gender + ", and the race is " + d.race)
                    .on("mouseout", (e, d) => document.getElementById("description").innerHTML = "&nbsp;")
                    // Animate the radius to have the circles slowly grow to full size.
                    .transition()
                    .delay(600*!circles.exit().empty())
                    .duration(600)
                    .attr("fill-opacity", .4)
                    .attr("r", 2),

                // There is no modification required for updated circles. They can remain unchanged...
                update => update,

                exit => exit.transition().duration(600).attr("r", 0).remove()
            )
        })

    }
}