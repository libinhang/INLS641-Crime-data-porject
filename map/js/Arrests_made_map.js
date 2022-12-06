class AMmap {
    constructor(container_id) {
        this.arrest_url = "../data/clean_ch_arrests.csv";
        this.container_id = container_id
        this.cata_color = d3.scaleOrdinal(d3.schemeCategory10);
        this.loadAndPrepare()
        this.height = 400;
        this.width = 400;
        this.formatDateIntoYear = d3.timeFormat("%Y");
        // Select the SVG element for the map.
        this.svg = d3.select("#" + this.container_id);
    }
    loadAndPrepare(){
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
        })
    }

    render(category, quarter, hour_block) {
        // Load arrest made data.
        d3.csv(this.arrest_url, d => {
            return {
                longitude: d.X,
                latitude: d.Y,
                id: d.Incident_Id,
                charges: d.Primary_Charge,
                charge_cat: d.Category,
                sub_cat: d.Subcategory,
                street: d.Street,
                date: d.Date_of_Arrest,
                age: d.Age,
                race: d.Race,
                gender: d.Gender,
                ethnicity: d.Ethnicity,
                type: d.Type_of_Arrest,
                drug_or_alcohol: d.Drugs_or_Alcohol_Present
            }
        }).then(data => {

            let new_data = data
            if (category=="Against Minors"||category=="Fraud" ||category=="Obstruction" || category=="Property" ||
                category=="Theft" || category=="Vehicle"  || category=="Weapons"  || category=="Alcohol/Drugs" ||
                category=="Violent" || category=="Others"){
                new_data = new_data.filter(d => d.charge_cat === category)
            } else if (category != "All") {
                new_data = new_data.filter(d => d.sub_cat === category)
            } else {
                new_data = new_data
            }
            let first_month = 0
            let last_month = 0
            if (quarter == 1) {
                first_month = 0
                last_month = 2
            } else if (quarter == 2) {
                first_month = 3
                last_month = 5
            } else if (quarter == 3) {
                first_month = 6
                last_month = 8
            } else if (quarter == 4) {
                first_month = 9
                last_month = 11
            }

            let block_start = 0
            let block_end = 0
            if (hour_block == 1) {
                block_start = 6
                block_end = 12
            } else if (hour_block == 2) {
                block_start = 12
                block_end = 19
            } else if (hour_block == 3) {
                block_start = 19
                block_end = 24
            } else if (hour_block == 4) {
                block_start = 0
                block_end = 6
            }

            let time_data_1 = new_data.filter(d =>
                new Date(d.date).getMonth() <= last_month && new Date(d.date).getMonth() >= first_month
            )
            let time_data_2 = time_data_1.filter(d =>
                new Date(d.date).getHours() >= block_start && new Date(d.date).getHours() < block_end
            )


            //draw data through time
            let circles = this.svg.select("g").selectAll("circle").data(time_data_2, d => d.id);
            circles.join(
                enter=>enter.append("circle")
                    .attr("r", 0)
                    .attr("cx", d => this.projection([d.longitude, d.latitude])[0])
                    .attr("cy", d => this.projection([d.longitude, d.latitude])[1])
                    .style("fill", d => this.cata_color(d.charge_cat))
                    .on("click", (e, d) => document.getElementById("description").innerHTML = "A " + d.age + " year old " +
                        d.race + " " + d.gender + " was arrested on " +
                        d.street + " for " + d.charges)
                    // Animate the radius to have the circles slowly grow to full size.
                    .transition()
                    .delay(600 * !circles.exit().empty())
                    .duration(600)
                    .attr("r", 5),

                // There is no modification required for updated circles. They can remain unchanged...
                update=>update,

                exit => exit.transition().duration(1000).attr("r", 0).remove()
            )


        }).catch(error => {
            console.log("Error when loading or processing the CSV data.")
            console.log(error);
        })

    }


}