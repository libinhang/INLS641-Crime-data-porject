class TwoMaps{
    constructor(container_id) {
        this.arrest_url = "../data/Police_Arrests_Made.csv";
        this.incident_url = "../data/Police_Incident_Reports_Written.csv"
        this.container_id = container_id;
        this.loadAndPrepare();
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
            console.log("success")
            console.log(data)
        }).catch(error=>{
            console.log("Error when loading or processing the CSV data.")
            console.log(error);
        })

        //load incident reports data
        d3.csv(this.incident_url, d => {
            return {
                longitude: d.X,
                latitude: d.Y,
                id: d.Incident_ID,
                offense: d.Offense,
                street: d.Street,
                city: d.City,
                date_of_report: d.Date_of_Report,
                date_of_occurrence: d.Date_of_Occurrence,
                victim_age: d.Victim_Age,
                victim_race: d.Victim_Race,
                victim_gender: d.Victim_Gender,
            }
        }).then(data=>{
            console.log("success")
            console.log(data)
        }).catch(error=>{
            console.log("Error when loading or processing the CSV data.")
            console.log(error);
        })
    }
    render(){
    }
}