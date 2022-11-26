class Pie_Charts {
    constructor(container_one_id, container_two_id) {
        this.url = "js/data/clean_ch_arrests.csv";
        this.svg_id_one = container_one_id;
        this.svg_id_two = container_two_id;

        this.loadandprepare();
    }

    loadandprepare() {
        d3.csv(this.url, d => {
            return{
                id: d.Incident_Id,
                sex: d.Gender,
                ethnicity: d.Ethnicity
            }
        }).then(data => {
            let sex_data_rollup = d3.rollup(data, group => d3.count(group, d => d.id), d => d.sex);
            let sex_data = d3.map(sex_data_rollup, d => d)
            let ethnicity_data_rollup = d3.rollup(data, group => d3.count(group, d => d.id), d => d.ethnicity);
            let ethnicity_data = d3.map(ethnicity_data_rollup, d => d)

            this.render(sex_data, ethnicity_data);
        });
    }

    render(s_data, e_data) {
        let width = 250,
            height = 250,
            margin = 40,
            oradius = Math.min(width, height) / 2 - margin,
            iradius = 50;

        let pie = d3.pie().value(d => d[1]);

        let pie_labels = d3.arc()
            .outerRadius(oradius)
            .innerRadius(iradius);

        let colors_one = d3.scaleOrdinal()
            .domain(s_data)
            .range(["#F79000", "#8400A5", "#F1E3F3"]);

        let colors_two = d3.scaleOrdinal()
            .domain(e_data)
            .range(["#F1E3F3", "#FF6095", "#FF0055"]);

        let svg_sex = d3.selectAll("#" + this.svg_id_one)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        let pie_one_data = pie(s_data);

        svg_sex.selectAll("pie_one_piece")
            .data(pie_one_data)
            .enter()
            .append("path")
            .attr("d", d3.arc()
                .innerRadius(iradius)
                .outerRadius(oradius)
            )
            .attr("fill", d => colors_one(d))
            .attr("stroke", "white")
            .style("stroke-width", "3px")
            .style("opacity", 0.7);

        svg_sex.selectAll("pie_one_label")
            .data(pie_one_data)
            .enter()
            .append("text")
            .text(d => d.data[0])
            .attr("transform", d => {return "translate(" + pie_labels.centroid(d) + ")"})
            .style("font-weight", "bold")
            .style("font-family", "Helvetica")
            .style("font-size", 20);

        svg_sex.selectAll("pie_one_header")
            .data(pie_one_data)
            .enter()
            .append("text")
            .text("Sex")
            .style("font-size", 20)
            .attr("transform", "translate(" +  (-margin/2) + "," + (-margin * 2.5) + ")");


        let svg_ethnicity = d3.selectAll("#" + this.svg_id_two)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        let pie_two_data = pie(e_data);

        svg_ethnicity.selectAll("pie_two_piece")
            .data(pie_two_data)
            .enter()
            .append("path")
            .attr("d", d3.arc()
                .innerRadius(iradius)
                .outerRadius(oradius)
            )
            .attr("fill", d => colors_two(d))
            .attr("stroke", "white")
            .style("stroke-width", "3px")
            .style("opacity", 0.7);

        svg_ethnicity.selectAll("pie_two_label")
            .data(pie_two_data)
            .enter()
            .append("text")
            .text(d => d.data[0])
            .attr("transform", d => {return "translate(" + pie_labels.centroid(d) + ")"})
            .style("font-weight", "bold")
            .style("font-family", "Helvetica")
            .style("font-size", 20);

        svg_ethnicity.selectAll("pie_two_header")
            .data(pie_one_data)
            .enter()
            .append("text")
            .text("Ethnicity")
            .style("font-size", 20)
            .attr("transform", "translate(" +  (-margin/2) + "," + (-margin * 2.5) + ")");
    }

}