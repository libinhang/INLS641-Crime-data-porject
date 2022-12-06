class Bar_chart {
    constructor(container_id) {
        this.url = "../data/clean_ch_arrests.csv";
        this.formatDateIntoYear = d3.timeFormat("%Y");
        this.svg_id = container_id;
        this.cata_color = d3.scaleOrdinal(d3.schemeCategory10);
        this.LoadAndPrepare()
    }

    LoadAndPrepare() {
        this.category_data = d3.csv(this.url, d => {
            return {
                date:d.Date_of_Arrest,
                id: d.Incident_Id,
                charge_cat: d.Category
            }
        })
    }

    render(quarter, hour_block) {
        this.category_data.then(data => {

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

            let filtered_data = data.filter(d =>
                new Date(d.date).getMonth() <= last_month && new Date(d.date).getMonth() >= first_month
            )
            let time_data_2 = filtered_data.filter(d =>
                new Date(d.date).getHours() >= block_start && new Date(d.date).getHours() < block_end
            )
            let data_rollup = d3.rollup(time_data_2, group => d3.count(group, d => d.id), d => d.charge_cat);

            let axis_rollup =d3.rollup(data, group => d3.count(group, d => d.id), d => d.charge_cat);
            let axis_data = d3.map(axis_rollup,d=>d)


            let category_data = d3.map(data_rollup, d => d)

            let svg = d3.selectAll("#" + this.svg_id);

            let bar_spacing = 2;
            let margin = {top: 20, right: 10, bottom: 10, left: 85},
                width = 600 - margin.left - margin.right,
                height = 200 - margin.top - margin.bottom;

            let x = d3.scaleLinear()
                .domain([0, 700])
                .range([0, width]);

            let y = d3.scaleBand()
                .domain(axis_data.map(d => d[0]))
                .range([0,height])
                .padding(0.1)


            svg.append("g")
                .attr("id", "Yaxis")
                .attr("transform", "translate("+margin.left+",0)")
                .call(d3.axisLeft(y))


            svg.append("g")
                .attr("class", "Xaxis")
                .attr("transform", "translate(" + margin.left + "," + height + ")")
                .call(d3.axisBottom(x));

            let bars = svg.selectAll("rect").data(category_data,d=>d[1])
            bars.join(
                enter=>enter.append("rect")
                    .attr("class", "bar")
                    .style("fill", d=> this.cata_color(d[0]))
                    .attr("x", margin.left)
                    .attr("y", (d, i) => y(d[0]))
                    .attr("height", height/(10 + bar_spacing))
                    .sort((a,b) => d3.ascending(a[0], b[0]))
                    .attr("width", 0)
                    // .transition()
                    // .delay(300 * !bars.exit().empty())
                    // .duration(300)
                    .attr("width", d => x(d[1])),
                update=>update.data(category_data,d=>d[0]),
                exit => exit.transition().duration(400).attr("width", 0).remove()
            )


        }).catch(error => {
            console.log("Error when loading or processing the CSV data.")
            console.log(error);
        })
    }

}

