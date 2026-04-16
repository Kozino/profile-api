import axios from 'axios';

const APIS = {
  GENDERIZE: 'https://api.genderize.io',
  AGIFY: 'https://api.agify.io',
  NATIONALIZE: 'https://api.nationalize.io'
};

async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await axios.get(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function fetchGenderData(name) {
  try {
    const response = await fetchWithTimeout(`${APIS.GENDERIZE}?name=${name}`);
    const data = response.data;
    
    if (!data.gender || data.count === 0) {
      throw new Error('Genderize returned an invalid response');
    }
    
    return {
      gender: data.gender,
      probability: data.probability,
      count: data.count
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`Genderize returned an invalid response`);
    }
    throw error;
  }
}

export async function fetchAgeData(name) {
  try {
    const response = await fetchWithTimeout(`${APIS.AGIFY}?name=${name}`);
    const data = response.data;
    
    if (!data.age) {
      throw new Error('Agify returned an invalid response');
    }
    
    return { age: data.age };
  } catch (error) {
    if (error.response) {
      throw new Error(`Agify returned an invalid response`);
    }
    throw error;
  }
}

export async function fetchNationalityData(name) {
  try {
    const response = await fetchWithTimeout(`${APIS.NATIONALIZE}?name=${name}`);
    const data = response.data;
    
    if (!data.country || data.country.length === 0) {
      throw new Error('Nationalize returned an invalid response');
    }
    
    const topCountry = data.country.reduce((max, country) => 
      country.probability > max.probability ? country : max
    );
    
    return {
      country_id: topCountry.country_id,
      probability: topCountry.probability
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`Nationalize returned an invalid response`);
    }
    throw error;
  }
}
