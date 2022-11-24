class Bar_chart {
    constructor(container_id) {
        this.url = "js/data/clean_ch_arrests.csv";
        this.svg_id = container_id;

        this.loadandprepare();
    }

    loadandprepare() {
        d3.csv(this.url, d => {
            return {
                id: d.Incident_Id,
                charge_cat: d.Category
            }
        }).then(data => {
            let data_rollup = d3.rollup(data, group => d3.count(group, d => d.id), d => d.charge_cat);
            /*/!*     data_rollup.sort((x,y) => d3.ascending(x.value, y.value));*!/*/
            console.log(data_rollup)

            let category_data = d3.map(data_rollup, d => d)
            console.log(category_data)
            console.log(d3.max(category_data.map(d => {
                return d[1]
            })))

            this.render(category_data);
        })
    }

    render(category_data) {
        let svg = d3.selectAll("#" + this.svg_id);

        let bar_spacing = 2;
        let margin = {top: 20, right: 10, bottom: 10, left: 90},
            width = 500 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        let x = d3.scaleLinear()
            .domain([0, d3.max(category_data.map(d => {return d[1]}))])
            .range([0, width]);

        let y = d3.scaleBand()
            .domain(category_data.map(d => {return d[0]}))
            .range([0,height])
            .padding(0.1)

        svg.selectAll("rect")
            .data(category_data).enter().append("rect")
            .style("fill", "steelblue")
            .attr("x", margin.left)
            .attr("y", (d, i) => y(d[0]))
            .attr("height", height/(10 + bar_spacing))
            .attr("width", d => x(d[1]))
            .sort((a,b) => d3.ascending(a[0], b[0]));

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate("+margin.left+",0)")
            .call(d3.axisLeft(y));

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + "," + height + ")")
            .call(d3.axisBottom(x));
    }

}

let x = new Bar_chart("sample")
x.loadAndPrepare("sample")
x.render("sample")
/*
console.log("hi")*/
