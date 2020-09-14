import axios from 'axios'

export const useFetch = async (url, payload = {}, method = 'GET') => {
  try {
    const {data} = await axios({
      method,
      url,
      data: payload
    });
    return data
  } catch (error) {
    return {error};
  }
};