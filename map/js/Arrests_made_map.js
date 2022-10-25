class AMmap{
    constructor(container_id) {
        this.arrest_url = "../data/Police_Arrests_Made.csv";
        this.container_id = container_id
        this.loadAndPrepare();
        this.height = 1000;
        this.width = 1000;

        // Select the SVG element for the map.
        this.svg = d3.select("#" + this.container_id);
    }
    loadAndPrepare(){
        // Load arrest made data.
        d3.csv(this.arrest_url, d => {
            return {
                longitude: d.X,
                latitude: d.Y,
                id: d.Incident_Id,
                charges: d.Primary_Charge,
                street: d.Street,
                city: d.City,
                date: d.Date_of_Arrest,
                age: d.Age,
                race: d.Race,
                gender: d.Gender,
                ethnicity: d.Ethnicity,
                type: d.Type_of_Arrest,
                drug_or_alcohol: d.Drugs_or_Alcohol_Present,
            }
        }).then(data=>{
            //process data
            console.log("success")
            console.log(data)
        }).catch(error=>{
            console.log("Error when loading or processing the CSV data.")
            console.log(error);
        })
    }
    render(map_type) {
        // load map

    }

}