import axios from 'axios';

export const isTokenExpired = async (token) => {
  if (!token) return true;
  try {
    const response = await axios.post('https://nexuslock-941324057012.southamerica-east1.run.app/api/Auth/is-token-valid', { token });
    console.log(response.data);
    return !response.data.isValid;
  } catch (error) {
    console.error('Error validating token:', error);
    return true;
  }
};
