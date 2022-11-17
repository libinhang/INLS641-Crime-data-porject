class AMmap {
    constructor(container_id) {
        this.arrest_url = "../data/clean_ch_arrests.csv";
        this.container_id = container_id
        this.cata_color = d3.scaleOrdinal(d3.schemeCategory10);
        this.loadAndPrepare()
        this.height = 400;
        this.width = 400;
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

    render(type,_subs) {
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
            //filtering data
            let data_subs = data
            if(type==="main_cata" || type ==="all_subcata"){
                if (_subs != "All") {
                    data_subs = data.filter(d => d.charge_cat === _subs)
                }
            }else if(type=="sub_cata"){
                data_subs = data.filter(d=>d.sub_cat === _subs)
            }
            let circles = this.svg.select("g").selectAll("circle").data(data_subs, d => d.id);
            circles.join(
                enter => enter.append("circle")
                    .attr("r", 0)
                    .attr("cx", d => this.projection([d.longitude,d.latitude])[0])
                    .attr("cy", d => this.projection([d.longitude,d.latitude])[1])
                    .style("fill", d => this.cata_color(d.charge_cat))
                    .on("mouseover", (e, d) => document.getElementById("description").innerHTML = "Arrest " + d.id + " happened in " +
                        d.street + " and the charge of it is " + d.charges + ". The suspect is a " + d.age + " years old " + d.gender + ", and the race is " + d.race)
                    .on("mouseout", (e, d) => document.getElementById("description").innerHTML = "&nbsp;")
                    // Animate the radius to have the circles slowly grow to full size.
                    .transition()
                    .delay(600*!circles.exit().empty())
                    .duration(600)
                    .attr("r", 2),

                // There is no modification required for updated circles. They can remain unchanged...
                update => update,

                exit => exit.transition().duration(600).attr("r", 0).remove()
            )

            if(_subs="play") {
                d3.interval(this.startTimeline(), 4000)
            }else if(_subs="stop"){

            }


        }).catch(error => {
            console.log("Error when loading or processing the CSV data.")
            console.log(error);
        })

    }
     startTimeline () {
        // d3.select('#timeline').transition()
        //     .duration(4000)
        //     .attrTween("width", function () {
        //         let i = d3.interpolate(0, 1000);
        //         let ci = d3.interpolate('#2394F5', '#BDF436');
        //         let that = this;
        //         return t=> {
        //             that.style.width = i(t) + 'px';
        //             that.style.background = ci(t);
        //         };
        //     });
    }
}