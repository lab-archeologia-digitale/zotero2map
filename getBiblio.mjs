import zotero_client from 'zotero-api-client';
const api = zotero_client['default'];

const groupId = 336647;

const validItemTypes = [
  'book',
  'bookSection',
  'journalArticle',
  'report'
];

/**
 * Gets array of {limit} records from grpoup library.
 * Only validItemTypes will be retrieved
 * 
 * @param {int} limit Total number of items to retrieve; all records will be retrieved if missing
 * @param {int} start Start offset, Default: 0
 * @param {Array} results Array of results
 * @returns {Array} of results
 */
const getBiblio = async ( limit, start, results ) => {

  // By default set to max is false
  let set_to_max = false;

  // If no limit is provided, set_to_max will be set to true
  if (typeof limit === 'undefined'){
    limit = 100;
    set_to_max = true;
  }
  
  // start is set to 0 by default
  start = start || 0;

  // Results is an empty array, by default
  results = results || [];

  // Run a query on the Zotero API
  const zotResponse = await api().library("group", groupId).items().get({
    start: start,
    limit: (limit - start), // in verità Zotero prenderà max 100 item
    itemType: validItemTypes.join(' || ')
  });

  // If set_to_max is true, the limit will be set to maximum numner of records
  if (set_to_max){
    limit = zotResponse.getTotalResults();
  }

  // Add result data to array
  results = results.concat(zotResponse.getData());

  // If limit is not reached, re-run the function with updated parameters
  if ((start + 100) < limit ){    
    results = await getBiblio(limit, start + 100, results);
  }

  // Finally return result
  return results;
};

export default getBiblio;
