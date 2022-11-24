class Bar_chart {
    constructor(container_id) {
        this.url = "../data/clean_ch_arrests.csv";
        this.formatDateIntoYear = d3.timeFormat("%Y");
        this.svg_id = container_id;
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
            console.log(data_rollup)

            let category_data = d3.map(data_rollup, d => d)
            console.log(category_data)

            let svg = d3.selectAll("#" + this.svg_id);

            let bar_spacing = 2;
            let margin = {top: 20, right: 10, bottom: 10, left: 90},
                width = 500 - margin.left - margin.right,
                height = 200 - margin.top - margin.bottom;

            let x = d3.scaleLinear()
                .domain([0, d3.max(axis_data.map(d => d[1]))])
                .range([0, width]);

            let y = d3.scaleBand()
                .domain(axis_data.map(d => d[0]))
                .range([0,height])
                .padding(0.1)

            let bars = svg.selectAll("rect").data(category_data,d=>d.id)
            bars.join(
                enter=>enter.append("rect")
                    .attr("class", "bar")
                    .style("fill", "steelblue")
                    .attr("x", margin.left)
                    .attr("y", (d, i) => y(d[0]))
                    .attr("height", height/(10 + bar_spacing))
                    // .sort((a,b) => d3.ascending(a[0], b[0]))
                    .attr("width", 0)
                    .transition()
                    .delay(300 * !bars.exit().empty())
                    .duration(300)
                    .attr("width", d => x(d[1])),
                update=>update,
                exit => exit.transition().duration(300).attr("width", 0).remove()
            )

           svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate("+margin.left+",0)")
                .call(d3.axisLeft(y))

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + margin.left + "," + height + ")")
                .call(d3.axisBottom(x));
            // svg.append("g")
            //     .attr("class","text")
            //     .data(d)

        })
    }

}


/*
console.log("hi")*/