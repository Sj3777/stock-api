
PROCESS TO RUN THE APPLICATION
1. npm i
2. npm run start

/*NOTE*/
//**************************************NOTE***********************************************/
//I have used some free api for stock report data, the data is not coming as per desired format we want.
// still i have tried my best to get data, and implemented main functionality that is Cache Mechanism
// date filter is not working in this api, as expected.
//*************************************************************************************/

*EXTERNAL API* - https://www.alphavantage.co/documentation/



API - GET DATA OF STOCK 
TYPE - GET
URL - localhost:3000/timeseries?symbol=IBN&period=1day&start=2024-05-14T10:00:00Z&end=2024-05-01T10:05:00Z
RESPONSE - {
  "symbol": "IBN",
  "period": "1day",
  "data": [
    {
      "time": "2024-05-14",
      "open": 26.85,
      "high": 26.91,
      "low": 26.8,
      "close": 26.9
    },
    {
      "time": "2024-05-13",
      "open": 26.96,
      "high": 27.06,
      "low": 26.88,
      "close": 26.9
    },
    {
      "time": "2024-05-10",
      "open": 26.77,
      "high": 26.84,
      "low": 26.7,
      "close": 26.79
    },
    {
      "time": "2024-05-09",
      "open": 26.8,
      "high": 26.84,
      "low": 26.72,
      "close": 26.75
    },
    {
      "time": "2024-05-08",
      "open": 26.93,
      "high": 27.08,
      "low": 26.88,
      "close": 26.94
    },
    {
      "time": "2024-05-07",
      "open": 27.17,
      "high": 27.17,
      "low": 26.93,
      "close": 27.12
    },
    {
      "time": "2024-05-06",
      "open": 27.34,
      "high": 27.55,
      "low": 27.29,
      "close": 27.51
    },
    {
      "time": "2024-05-03",
      "open": 27.46,
      "high": 27.49,
      "low": 27.125,
      "close": 27.34
    },
    {
      "time": "2024-05-02",
      "open": 27.55,
      "high": 27.7,
      "low": 27.505,
      "close": 27.57
    }
  ]
}