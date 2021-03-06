const trimQuery = require("../../util/trimQuery");
const getPool = require("../../database/getPool");
const groupBy = require("../../util/groupBy");

/**
 * Group the data by country. This can save a lot of bandwidth in large queries
 * @param {*} data An array of emission entries
 */
function groupEmissionData(data) {
    const grouped = groupBy(data, x => x.country.trim());
    const arr = Object.keys(grouped)
        .map(countryName => {
            const countryData = grouped[countryName]
                .map(({ country, ...relevantData }) => relevantData)
                // Turn population into Number type since it is stored as BIGINT in the database
                // and therefore will be interpreted as string in JavaScript (don't worry it will not overflow)
                // NOTE: Number(null) === 0 and we don't want to return a number if the actual value is null
                .map(({ population, ...rest }) => Object.assign({}, rest, { population: Number(population) || population }));
            return {
                name: countryName,
                data: countryData
            };
        });
    return {
        countries: arr
    };
}

function listEmissions(req, res) {
    req.params.country = "";
    return listEmissionsByCountry(req, res);
}

function listEmissionsByCountry(req, res) {
    // First set the country to a query friendly format
    const country = trimQuery(req.params.country);
    const pool = getPool();
    return pool.query(`
        SELECT * FROM emissions
        WHERE country like $1
        ORDER BY CASE
            WHEN country LIKE $2 THEN 0
            ELSE 1
        END, country, year;
    `, [`%${country}%`, `${country}%`])
        .then(x => res.json(groupEmissionData(x.rows)).send())
        .catch(() => res.status(500).send())
        .then(() => pool.end());
}

module.exports = { listEmissions, listEmissionsByCountry };