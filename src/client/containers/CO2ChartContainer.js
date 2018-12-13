import { connect } from "react-redux";
import CO2Chart from "../components/CO2Chart";

const mapStateToProps = state => {
    return {
        formatEmissions: x => x.toFixed(state.perCapita ? 5 : 2),
        yLabel: `CO² emissions in ${state.perCapita ? "kg per capita" : "10³kg"}`
    }
};

export default connect(mapStateToProps)(CO2Chart);