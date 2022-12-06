class Pie_chart {
    constructor(container_one_id, container_two_id, container_three_id,container_four_id) {
        this.url = "../data/clean_ch_arrests.csv";
        this.svg_id_one = container_one_id;
        this.svg_id_two = container_two_id;
        this.svg_id_three = container_three_id;
        this.svg_id_four = container_four_id;
        this.svg1 = d3.selectAll("#" + this.svg_id_one)
        this.svg2 = d3.selectAll("#" + this.svg_id_two)
        this.bar1 = d3.selectAll("#" + this.svg_id_three)
        this.bar2 = d3.selectAll("#" + this.svg_id_four)
        this.width = 270
        this.height = 270
        this.margin = 45
        this.oradius = Math.min(this.width, this.height) / 2 - this.margin
        this.iradius = 50
        this.formatDateIntoYear = d3.timeFormat("%Y");
        this.loadAndPrepare();
    }

    loadAndPrepare() {
        this.loaddata = d3.csv(this.url, d => {
            return{
                id: d.Incident_Id,
                sex: d.Gender,
                ethnicity: d.Ethnicity,
                race: d.Race,
                date: d.Date_of_Arrest,
                charge_cat: d.Category,
                sub_cat: d.Subcategory,
                age_range: d.Age_range
            }
        })
    }

    render(quarter, category, hour_block) {
        this.loaddata.then(ori_data => {

            // filter data by category or subcategory
            let new_data = ori_data
            if(category=="Against Minors"||category=="Fraud" ||category=="Obstruction" || category=="Property" ||
                category=="Theft" || category=="Vehicle"  || category=="Weapons"  || category=="Alcohol/Drugs" ||
                category=="Violent" || category=="Others"){
                new_data = new_data.filter(d => d.charge_cat === category)
            } else if (category != "All") {
                new_data = new_data.filter(d => d.sub_cat === category)
            } else {
                new_data = new_data
            }

            // filter data by Month and Hour
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

            //rolling up data
            let sex_data_rollup = d3.rollup(time_data_2, group => d3.count(group, d => d.id), d => d.sex);
            let sex_data = d3.map(sex_data_rollup, d => d)

            let ethnicity_data_rollup = d3.rollup(time_data_2, group => d3.count(group, d => d.id), d => d.ethnicity);
            let ethnicity_data = d3.map(ethnicity_data_rollup, d => d);

            let age_data_rollup = d3.rollup(time_data_2, group => d3.count(group, d => d.id), d => d.age_range);
            let race_data_rollup = d3.rollup(time_data_2, group => d3.count(group, d => d.id), d => d.race);

            let age_data = d3.map(age_data_rollup, d => d);
            let race_data = d3.map(race_data_rollup, d => d);
            let age_axis_data_rollup = d3.rollup(time_data_2, group => d3.count(group, d => d.id), d => d.age_range);
            let age_axis = d3.map(age_axis_data_rollup, d => d);
            let race_axis_data_rollup = d3.rollup(time_data_2, group => d3.count(group, d => d.id), d => d.race);
            let race_axis = d3.map(race_axis_data_rollup, d => d);

            //draw bar chart

            let margin = {top: 50, right: 0, bottom: 10, left: 45},
                width = 450 - margin.left - margin.right,
                height = 175 - margin.top - margin.bottom;

            let age_x = d3.scaleLinear()
                .domain([0, d3.max(age_axis.map(d => d[1]))])
                // .domain([0, 26])
                .range([0, width]);

            let age_y = d3.scaleBand()
                .domain(age_axis.map(d => d[0], d => d[0]))
                /*.domain(["18-30", "31-50", "51-70", "Over 70"])*/
                .range([0,height])
                .padding(0.5)

            let race_x = d3.scaleLinear()
                .domain([0, d3.max(race_axis.map(d => d[1]))])
                // .domain([0, 28])
                .range([0, width]);

            let race_y = d3.scaleBand()
                .domain(race_axis.map(d => d[0], d => d[0]))
                .range([0,height])
                .padding(0.5)

            let b_svg1 = this.bar1
            let bar_one = b_svg1.selectAll("rect").data(age_data,d=>d[1])
            bar_one.join(
                enter=>enter.append("rect")
                    .attr("class", "bar")
                    .style("fill","#FF9933")
                    .attr("x", margin.left)
                    .attr("y", (d) => age_y(d[0]))
                    .attr("height", height/(10))
                    .attr("width", d => age_x(d[1])),
                update=>update.data(age_data,d=>d[1]),
                exit => exit.transition().duration(400).attr("width", 0).remove()
            )

            b_svg1.append("g")
                .attr("id", "b1_yaxis")
                .attr("transform", "translate("+margin.left+",0)")
                .call(d3.axisLeft(age_y))

            b_svg1.append("g")
                .attr("id", "b1_xaxis")
                .attr("transform", "translate(" + margin.left + "," + height + ")")
                .call(d3.axisBottom(age_x));


            b_svg1.selectAll("#b1_yaxis")
                .transition()
                .call(d3.axisLeft(age_y))
            b_svg1.selectAll("#b1_xaxis")
                .transition()
                .call(d3.axisBottom(age_x))

            let b_svg2 = this.bar2
            let bar_two = b_svg2.selectAll("rect").data(race_data,d=>d[1])
            bar_two.join(
                enter=>enter.append("rect")
                    .attr("class", "bar")
                    .style("fill","#FF6433")
                    .attr("x", margin.left)
                    .attr("y", (d, i) => race_y(d[0]))
                    .attr("height", height/(12))
                    .attr("width", d => race_x(d[1])),
                update=>update,
                exit => exit.transition().duration(400).attr("width", 0).remove()
            )

            b_svg2.append("g")
                .attr("id", "b2_yaxis")
                .attr("transform", "translate("+margin.left+",0)")
                .call(d3.axisLeft(race_y))

            b_svg2.append("g")
                .attr("id", "b2_xaxis")
                .attr("transform", "translate(" + margin.left + "," + height + ")")
                .call(d3.axisBottom(race_x));

            b_svg2.selectAll("#b2_yaxis")
                .transition()
                .call(d3.axisLeft(race_y))
            b_svg2.selectAll("#b2_xaxis")
                .transition()
                .call(d3.axisBottom(race_x))

            //getting pie data
            let pie = d3.pie().value(d => d[1]);

            let pie_labels = d3.arc()
                .outerRadius(this.oradius)
                .innerRadius(this.iradius);

            let colors_one = d3.scaleOrdinal()
                .domain(sex_data)
                .range(["#F79000", "#8400A5", "#F1E3F3"]);

            let colors_two = d3.scaleOrdinal()
                .domain(ethnicity_data)
                .range(["#F1E3F3", "#FF6095", "#FF0055"]);

            let pie_one_data = pie(sex_data);
            let svg_sex = this.svg1
                .attr("width", this.width)
                .attr("height", this.height)
                .append("g")
                .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")")

            svg_sex.selectAll("pie_one")
                .data(pie_one_data)
                .join("path")
                .transition()
                .duration(1000)
                .attr('d', d3.arc()
                    .innerRadius(this.iradius)
                    .outerRadius(this.oradius)
                )
                .attr("fill", d => colors_one(d))
                .attr("stroke", "white")
                .style("stroke-width", "3px")
                .style("opacity", 1)



            svg_sex.selectAll("pie_one_label")
                .data(pie_one_data)
                .enter()
                .append("text")
                .text(d => d.data[0])
                .attr("transform", d => {return "translate(" + pie_labels.centroid(d) + ")"})
                .attr("text-anchor", "end")
                .style("font-weight", "bold")
                .style("font-family", "Helvetica")
                .style("font-size", 15);

            svg_sex.selectAll("pie_one_header")
                .data(pie_one_data)
                .enter()
                .append("text")
                .text("Sex")
                .style("font-size", 20)
                .attr("transform", "translate(" +  (-this.margin/2) + "," + (-this.margin * 2.5) + ")");

            //pie two
            let svg_ethnicity = this.svg2
                .attr("width", this.width)
                .attr("height", this.height)
                .append("g")
                .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")")



            let pie_two_data = pie(ethnicity_data);

            svg_ethnicity.selectAll("pie_two")
                .data(pie_two_data)
                .join("path")
                .transition()
                .duration(1000)
                .attr('d', d3.arc()
                    .innerRadius(this.iradius)
                    .outerRadius(this.oradius)
                )
                .attr("fill", d => colors_two(d))
                .attr("stroke", "white")
                .style("stroke-width", "3px")
                .style("opacity", 1);

            svg_ethnicity.selectAll("pie_two_label")
                .data(pie_two_data)
                .enter()
                .append("text")
                .text(d => d.data[0])
                .attr("transform", d => {return "translate(" + pie_labels.centroid(d) + ")"})
                .style("font-weight", "bold")
                .style("font-family", "Helvetica")
                .style("font-size", 15);

            svg_ethnicity.selectAll("pie_two_header")
                .data(pie_two_data)
                .enter()
                .append("text")
                .text("Ethnicity")
                .style("font-size", 20)
                .attr("transform", "translate(" +  (-this.margin/2) + "," + (-this.margin * 2.5) + ")");
        }).catch(error => {
            console.log("Error when loading or processing the CSV data.")
            console.log(error);
        });

    }

}