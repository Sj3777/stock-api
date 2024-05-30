import express from 'express';
import NodeCache from 'node-cache';
import axios from 'axios';

const app = express();
const cache = new NodeCache({ stdTTL: 600 }); // Cache duration: 10 minutes

const ALPHA_VANTAGE_API_KEY = 'XMGPHBU525PS5N43'; // Replace with your API key


//**************************************NOTE***********************************************/
//I have used some free api for stock report data, the data is not coming as per desired format we want.
// still i have tried my best to get data, and implemented main functionality that is Cache Mechanism
// date filter is not working in this api, as expected.
//*************************************************************************************/


/**
 * Fetches timeseries data from the Alpha Vantage API.
 * @param {string} symbol - The symbol of the stock (e.g., AAPL).
 * @param {string} period - The period of the timeseries data (e.g., 1min, 5min).
 * @param {string} startTime - The start time of the data range.
 * @param {string} endTime - The end time of the data range.
 * @returns {Promise<Array>} - The fetched data from the external API.
 */
const fetchDataFromAPI = async (symbol, period, startTime, endTime) => {
  try {
    const intervalMap = {
      '1min': 'TIME_SERIES_INTRADAY',
      '5min': 'TIME_SERIES_INTRADAY',
      '1hour': 'TIME_SERIES_INTRADAY',
      '1day': 'TIME_SERIES_DAILY'
    };
    const interval = intervalMap[period] || 'TIME_SERIES_INTRADAY';
    const apiParams = {
      function: interval,
      symbol,
      apikey: ALPHA_VANTAGE_API_KEY
    };

    if (interval === 'TIME_SERIES_INTRADAY') {
      apiParams.interval = period;
    }

    const response = await axios.get('https://www.alphavantage.co/query', { params: apiParams });
    // console.log("api:::", response)
    const timeSeriesKey = interval === 'TIME_SERIES_DAILY' ? 'Time Series (Daily)' : `Time Series (${period})`;
    const timeSeriesData = response.data[timeSeriesKey];

    // Convert the start and end times to Date objects for comparison
    const start = new Date(startTime);
    const end = new Date(endTime);


    const data = interval === 'TIME_SERIES_INTRADAY' ? Object.keys(timeSeriesData)
      .map(time => ({
        time,
        open: parseFloat(timeSeriesData[time]['1. open']),
        high: parseFloat(timeSeriesData[time]['2. high']),
        low: parseFloat(timeSeriesData[time]['3. low']),
        close: parseFloat(timeSeriesData[time]['4. close'])
      })) : Object.keys(timeSeriesData).filter(time => {
        const currentTime = new Date(time);
        return currentTime <= start && currentTime >= end;
      })
        .map(time => ({
          time,
          open: parseFloat(timeSeriesData[time]['1. open']),
          high: parseFloat(timeSeriesData[time]['2. high']),
          low: parseFloat(timeSeriesData[time]['3. low']),
          close: parseFloat(timeSeriesData[time]['4. close'])
        }))
    return data;
  } catch (error) {
    console.error('Error fetching data from external API:', error);
    throw error;
  }
};

/**
 * Determines the cache intervals for the requested data range.
 * @param {string} symbol - The symbol of the stock.
 * @param {string} period - The period of the timeseries data.
 * @param {string} start - The start time of the request.
 * @param {string} end - The end time of the request.
 * @returns {Array} - An array of interval objects with keys and time ranges.
 */
const determineCacheIntervals = (symbol, period, start, end) => {
  // For simplicity, assume cache intervals are the same as the request interval
  return [{ key: `${symbol}-${period}-${start}-${end}`, start, end }];
};

app.get('/timeseries', async (req, res) => {
  const { symbol, period, start, end } = req.query;

  // Validate request parameters
  if (!symbol || !period || !start || !end) {
    return res.status(400).json({ error: 'Symbol, period, start time, and end time are required' });
  }

  const cacheKey = `${symbol}-${period}-${start}-${end}`;
  let cachedData = cache.get(cacheKey);

  // If the entire requested data is in the cache, return it
  if (cachedData) {
    console.log("*************SUCCESSFULLY FETCHED DATA FROM CACHE********************")
    return res.json({ symbol, period, data: cachedData });
  }

  let data = [];
  let missingIntervals = [];

  // Determine which parts of the requested data are in the cache
  const cacheIntervals = determineCacheIntervals(symbol, period, start, end);
  console.log("Intervals::", cacheIntervals)
  for (const interval of cacheIntervals) {
    const intervalData = cache.get(interval.key);
    if (intervalData) {
      data.push(...intervalData);
    } else {
      missingIntervals.push(interval);
    }
  }

  // Fetch missing data from the external API and combine with cached data
  if (missingIntervals.length > 0) {
    try {
      for (const interval of missingIntervals) {
        const intervalData = await fetchDataFromAPI(symbol, period, interval.start, interval.end);
        // console.log("CACHE INTERVAL:::::", intervalData);
        cache.set(interval.key, intervalData);
        data.push(...intervalData);
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch data from external API' });
    }
  }

  // Store the combined data in the cache and return it
  cache.set(cacheKey, data);
  console.log("*************SUCCESSFULLY FETCHED DATA FROM EXTERNAL API********************")
  res.json({ symbol, period, data });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});