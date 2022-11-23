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
        d3.json("../data/nc-counties.json").then(map_data=>{
            // Get the SVG container for the visualization, and create the projection needed for the map.
            let nc_county_map_data = topojson.feature(map_data, map_data.objects.cb_2015_north_carolina_county_20m);
            let projection = d3.geoAlbers()
                .rotate([79, 0])
                .fitSize([this.width,this.height], nc_county_map_data);

            // Define the path generator using the projection.
            let path = d3.geoPath().projection(projection);

            this.svg.append("g")
                .attr("class", "county")
                .selectAll("path")
                .data(nc_county_map_data.features, d=>d.properties.NAME)
                .enter().append("path")
                // .attr("fill", d=>{
                //     let county = nc_county_pop_data[d.properties.NAME + " County"];
                //     let pop = county.pop2022;
                //     return colormap(pop);
                // })
                .attr("stroke", "black")
                .attr("d", path);
        }).catch(error => {
            console.log("Error when loading or processing the CSV data.")
            console.log(error);
        })

    }
}