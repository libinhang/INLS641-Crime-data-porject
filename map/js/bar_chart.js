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

    render(_subs) {
        this.category_data.then(data => {
            let filtered_data = data.filter(d => this.formatDateIntoYear(new Date(d.date)) <= _subs)
            let data_rollup = d3.rollup(filtered_data, group => d3.count(group, d => d.id), d => d.charge_cat);

            let axis_rollup =d3.rollup(data, group => d3.count(group, d => d.id), d => d.charge_cat);
            let axis_data = d3.map(axis_rollup,d=>d)
            // console.log(data_rollup)

            let category_data = d3.map(data_rollup, d => d)

            let svg = d3.selectAll("#" + this.svg_id);

            let bar_spacing = 2;
            let margin = {top: 20, right: 10, bottom: 10, left: 85},
                width = 600 - margin.left - margin.right,
                height = 200 - margin.top - margin.bottom;

            let x = d3.scaleLinear()
                .domain([0, d3.max(axis_data.map(d => d[1]))])
                .range([0, width]);

            let y = d3.scaleBand()
                .domain(axis_data.map(d => d[0]))
                .range([0,height])
                .padding(0.1)


            let y_axis = svg.append("g")
                .attr("class", "Yaxis")
                .attr("transform", "translate("+margin.left+",0)")
                .call(d3.axisLeft(y))


           let x_axis = svg.append("g")
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


/*
console.log("hi")*/