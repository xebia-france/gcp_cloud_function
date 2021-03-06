const Datastore = require('@google-cloud/datastore');

const datastore = new Datastore({});

exports.parcelList = async (req, res) => {
    console.log('parcelList');
    if (!req.query.teamId) {
        res.status(500).send('Please provide the teamId in query');
    }

    console.log(`teamId = ${req.query.teamId}`);

    const teamId = req.query.teamId;
    const query = datastore
        .createQuery('Parcel')
        .filter('teamId', '=', teamId)
        .filter('status', '=', 'AVAILABLE');

    // Enable CORS
    res.set('Access-Control-Allow-Origin', "*");
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    try {
        const results = await datastore.runQuery(query);
        const parcels = results[0];

        const parcelsWithParcelId = parcels.map(p => {
            p.parcelId = p[datastore.KEY].name;
            return p;
        });

        res.status(200).send(parcelsWithParcelId);
    } catch (err) {
        console.error(`Oups cannot get data for teamId ${teamId}`, err);
        res.status(500).send(err);
    }

};

