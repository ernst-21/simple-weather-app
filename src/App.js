import React, { useState, useEffect } from 'react';
import { APIkey } from './key';
import { Input, Switch, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Search } = Input;

function App() {
  const [weatherData, setWeatherData] = useState(undefined);
  const [error, setError] = useState('');
  const [iconURL, setIconURL] = useState('');
  const [timeData, setTimeData] = useState(undefined);
  const [units, setUnits] = useState('imperial');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (weatherData) {
      onSearch(weatherData.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]);

  const onChange = (checked) => {
    if (checked) {
      setUnits('metric');
    } else {
      setUnits('imperial');
    }
  };

  const handleSpaces = (input) => {
    setWeatherData(undefined);
    setError('');
    //remove extra spaces
    const noExtras = input.replace(/ +(?= )/g, '');

    // replace them by + sign to be later added to url
    const plusForSpaces = noExtras.replace(' ', '+');
    return plusForSpaces;
  };

  // working with the date
  const d = new Date();
  //get UTC time in milliseconds
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;

  const onSearch = (value) => {
    if (value) {
      const finalValue = handleSpaces(value);
      setIsLoading(true);
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${finalValue}&units=${units}&appid=${APIkey}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.cod === 200) {
            setTimeData(
              new Date(utc + (3600000 * data.timezone) / 3600).toLocaleString()
            );
            setWeatherData(data);
            setIconURL(
              ` http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`
            );
            setIsLoading(false);
          } else if (data && data.cod === '404') {
            setError(data.message);
            setIsLoading(false);
          } else if (!data) {
            setError('No network connection');
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (err) {
            setError('Something went wrong.');
          }
        });
    } else if (value === '') {
      return null;
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 100 }} spin />;

  return (
    <div className="main-container">
      <Search
        placeholder="input city name"
        //allowClear
        onSearch={onSearch}
        style={{ width: 300 }}
        enterButton
      />
      <Switch
        style={{ marginTop: '2rem' }}
        onChange={onChange}
        checkedChildren=" °C "
        unCheckedChildren=" °F "
        size="default"
      />
      {isLoading && <Spin style={{ marginTop: '6rem' }} indicator={antIcon} />}
      {weatherData && (
        <div
          style={{ marginTop: '1rem', display: 'grid', placeItems: 'center' }}
        >
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <h1>{weatherData.name}</h1>
            <h3>{timeData}</h3>
          </div>
          {iconURL.length > 0 && (
            <img src={iconURL} alt={weatherData.weather[0].icon} />
          )}
          <h3>
            {Math.round(weatherData.main.temp_max)}° /{' '}
            {Math.round(weatherData.main.temp_min)}° Feels like:{' '}
            {weatherData.main.feels_like} {units === 'metric' ? ' °C' : ' °F'}
          </h3>
          <h3>Humidity : {weatherData.main.humidity}%</h3>
          <h3 className="description">{weatherData.weather[0].description}</h3>
        </div>
      )}
      {error && (
        <h2 style={{ textTransform: 'capitalize', marginTop: '4rem'}}>
          {error}
        </h2>
      )}
    </div>
  );
}

export default App;
