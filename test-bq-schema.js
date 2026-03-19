import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({ projectId: 'gen-lang-client-0540208645' });
const datasetId = 'pocket_gull_clinical';
const tableId = 'patient_records';

async function verify() {
    try {
        console.log("Fetching Table Metadata...");
        const [metadata] = await bigquery.dataset(datasetId).table(tableId).getMetadata();
        console.log("Table exists! Schema:");
        console.log(JSON.stringify(metadata.schema.fields, null, 2));
    } catch (e) {
        console.error("Table validation Error:");
        console.error(e.message);
    }
}

verify();
