class Pie_chart {
    constructor(container_one_id, container_two_id) {
        this.url = "../data/clean_ch_arrests.csv";
        this.svg_id_one = container_one_id;
        this.svg_id_two = container_two_id;
        this.svg1 = d3.selectAll("#" + this.svg_id_one)
        this.width = 250
        this.height = 250
        this.margin = 40
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
                sub_cat: d.Subcategory
            }
        })
    }

    render(type,_subs) {
        this.loaddata.then(ori_data => {
            //filtering
                let data = ori_data
                if(type=="filter" && _subs!="All" ){
                    console.log([type,_subs])
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
                let ethnicity_data = d3.map(ethnicity_data_rollup, d => d)

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

            console.log(pie_one_data)
            svg_sex.selectAll("path")
                .data(pie_one_data)
                .join("path")
                .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")")
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



            svg_sex.selectAll("text")
                .data(pie_one_data,d=>d[1])
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
                    .attr("transform", "translate(" +  (-this.margin/2) + "," + (-this.margin * 2.5) + ")");


                let svg_ethnicity = d3.selectAll("#" + this.svg_id_two)
                    .attr("width", this.width)
                    .attr("height", this.height)


                //pie tow
                let pie_two_data = pie(ethnicity_data);

            svg_ethnicity.selectAll("path")
                .data(pie_two_data)
                .join("path")
                .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")")
                .transition()
                .duration(1000)
                .attr("d", d3.arc()
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
                    .style("font-size", 20);

                svg_ethnicity.selectAll("pie_two_header")
                    .data(pie_one_data)
                    .enter()
                    .append("text")
                    .text("Ethnicity")
                    .style("font-size", 20)
                    .attr("transform", "translate(" +  (-this.margin/2) + "," + (-this.margin * 2.5) + ")");
            });

    }

}