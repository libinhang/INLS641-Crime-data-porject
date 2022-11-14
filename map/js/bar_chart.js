class Bar_chart {
    constructor(container_id) {
        this.arrest_url = "../data/clean_ch_arrests.csv";
        this.container_id = container_id
        this.cata_color = d3.scaleOrdinal(d3.schemeCategory10);
        this.loadAndPrepare();
        // Select the SVG element for the map.
        this.width = 250;
        this.height =600;
        this.svg = d3.select("#" + this.container_id)
            .append("svg")
            .attr("width", this.width)
            .attr("height",this.height)
            .append("g")
            .attr("transform", `translate(0,0)`);
    }
    loadAndPrepare(_subs){
        // Load arrest made data.
        d3.csv(this.arrest_url, d => {
            return {
                id: d.Incident_Id,
                charge_cat: d.Category,
            }
        }).then(data => {
            //filtering data
            let group_data = d3.rollup(data, group => {
                let count = d3.count(group, d=>d.id);
                return {
                    group_count: count,
                    charge_cat: group
                }
            }, d=>d.charge_cat);
            // console.log(group_data)
            this.render(data,group_data)
        }).catch(error => {
            console.log("Error when loading or processing the CSV data.")
            console.log(error);
        })
    }
render(data,group_data){
    let svg = this.svg
    //set up x and y
    let x = d3.scaleLinear()
        .domain([0, 3062])
        .range([ 0, this.width]);
    svg.append("g")
        .attr("transform", `translate(0,0)`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    let y = d3.scaleBand()
        .range([ 0, this.height ])
        .domain(data.map(d=>d.charge_cat))
        .padding(.1);

    svg.append("g")
        .call(d3.axisLeft(y))

    svg.selectAll("rect")
        .data(group_data)
        .join("rect")
        .attr("x", x(0) )
        .attr("y", d => y(d.charge_cat))
        .attr("width", d => x(d.group_count))
        .attr("height", y.bandwidth())
        .attr("fill", "#69b3a2")

}

}