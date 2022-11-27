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

    render(type,_subs) {
        this.loaddata.then(ori_data => {
            //filtering
                let data = ori_data
                if(type=="filter" && _subs!="All" ){
                    if(_subs=="Against Minors"||_subs=="Fraud" ||_subs=="Obstruction" || _subs=="Property" || _subs=="Theft" || _subs=="Vehicle"  || _subs=="Weapons" ){
                        data = data.filter(d => d.charge_cat === _subs)
                    }else{
                        data = data.filter(d => d.sub_cat === _subs)
                    }
                }
                if(type=="time"){
                    let crime_type = document.getElementById("cata_info").innerHTML
                    let time_data = data.filter(d => this.formatDateIntoYear(new Date(d.date)) <= _subs)
                    // console.log([type,time_data,_subs])
                    if(crime_type =="Crime type" || crime_type =="All") {
                        data = time_data
                    }else if(crime_type =="Alcohol/Drugs" || crime_type =="Violent" || crime_type =="Others" || crime_type =="Against Minors"){
                        data = time_data.filter(d => d.charge_cat === crime_type)
                    }else{
                        data = time_data.filter(d => d.sub_cat === crime_type)
                    }
                }

                //rolling up data
                let sex_data_rollup = d3.rollup(data, group => d3.count(group, d => d.id), d => d.sex);
                let sex_data = d3.map(sex_data_rollup, d => d)

                let ethnicity_data_rollup = d3.rollup(data, group => d3.count(group, d => d.id), d => d.ethnicity);
                let ethnicity_data = d3.map(ethnicity_data_rollup, d => d);

                let age_data_rollup = d3.rollup(data, group => d3.count(group, d => d.id), d => d.age_range);
                let race_data_rollup = d3.rollup(data, group => d3.count(group, d => d.id), d => d.race);

                let age_data = d3.map(age_data_rollup, d => d);
                let race_data = d3.map(race_data_rollup, d => d);
                let age_axis_data_rollup = d3.rollup(ori_data, group => d3.count(group, d => d.id), d => d.age_range);
                let age_axis = d3.map(age_axis_data_rollup, d => d);
                let race_axis_data_rollup = d3.rollup(ori_data, group => d3.count(group, d => d.id), d => d.race);
                let race_axis = d3.map(race_axis_data_rollup, d => d);
              console.log([age_data,race_data,age_data.map(d=>d[0])])

            //draw bar chart

            let margin = {top: 50, right: 10, bottom: 10, left: 85},
                width = 500 - margin.left - margin.right,
                height = 150 - margin.top - margin.bottom;

            let age_x = d3.scaleLinear()
                .domain([0, d3.max(age_axis.map(d => d[1]))])
                .range([0, width]);

            let age_y = d3.scaleBand()
                .domain(age_axis.map(d => d[0]))
                .range([0,height])
                .padding(0.1)

            let race_x = d3.scaleLinear()
                .domain([0, d3.max(race_axis.map(d => d[1]))])
                .range([0, width]);

            let race_y = d3.scaleBand()
                .domain(race_axis.map(d => d[0]))
                .range([0,height])
                .padding(0.1)

            let b_svg1 = this.bar1
            let bar_one = b_svg1.selectAll("rect").data(age_data,d=>d[1])
            bar_one.join(
                enter=>enter.append("rect")
                    .attr("class", "bar")
                    .style("fill","#FF9933")
                    .attr("x", margin.left)
                    .attr("y", (d, i) => age_y(d[0]))
                    .attr("height", height/(10 + 2))
                    .attr("width", d => age_x(d[1])),
                update=>update,
                exit => exit.transition().duration(400).attr("width", 0).remove()
            )

            b_svg1.append("g")
                .attr("class", "axis")
                .attr("transform", "translate("+margin.left+",0)")
                .call(d3.axisLeft(age_y))

            b_svg1.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + margin.left + "," + height + ")")
                .call(d3.axisBottom(age_x));

            let b_svg2 = this.bar2
            let bar_two = b_svg2.selectAll("rect").data(race_data,d=>d[1])
            bar_two.join(
                enter=>enter.append("rect")
                    .attr("class", "bar")
                    .style("fill","#FF6433")
                    .attr("x", margin.left)
                    .attr("y", (d, i) => race_y(d[0]))
                    .attr("height", height/(10 + 1))
                    .attr("width", d => race_x(d[1])),
                update=>update,
                exit => exit.transition().duration(400).attr("width", 0).remove()
            )

            b_svg2.append("g")
                .attr("class", "axis")
                .attr("transform", "translate("+margin.left+",0)")
                .call(d3.axisLeft(race_y))

            b_svg2.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + margin.left + "," + height + ")")
                .call(d3.axisBottom(race_x));


            // let x  = d3.scaleLinear()
            //     .domain([0, d3.max(age_data[1],d=>d[1])])
            //     .range([ 0, width]);
            //
            // bar_svg1.append("g")
            //     .attr("class", "axis")
            //     .attr("transform", "translate(" + margin.left + "," + height + ")")
            //     .call(d3.axisBottom(x))
            //     .selectAll("text")
            //     .style("text-anchor", "end");
            //
            // let y = d3.scaleBand()
            //     .range([ 0, height ])
            //     .domain(age_data.map(d=>d[0]))
            //     .padding(.1);
            //
            // bar_svg1.append("g")
            //     .attr("class", "axis")
            //     .attr("transform", "translate("+margin.left+",0)")
            //     .call(d3.axisLeft(y))
            //
            // bar_svg1.selectAll("myRect")
            //     .data(age_data,d=>d[1])
            //     .join("rect")
            //     .attr("x", x(0) )
            //     .attr("y", (d, i) => y(d[0]))
            //     .attr("width", d => x(d[1]))
            //     .attr("height", y.bandwidth())
            //     .attr("fill", "#69b3a2")

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
                    .style("font-size", 15)
                    .attr("transform", "translate(" +  (-this.margin/2) + "," + (-this.margin * 2.5) + ")");
            });

    }

}