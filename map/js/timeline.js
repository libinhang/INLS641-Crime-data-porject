class TimeLine{
    constructor(container_id) {
        this.incident_url = "../data/Police_Incident_Reports_Written.csv"
        this.container_id = container_id;
        this.svg = d3.select("#" + this.container_id);
    }
    render(){

    }
}