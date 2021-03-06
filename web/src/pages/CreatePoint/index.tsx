import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import './style.css';
import logo from '../../assets/logo.svg';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from '../../components/Dropzone';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });
  const [selectedUF, setSelectedUF] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [selectedFile, setSelectedFile] = useState<File>();

  function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUF(event.target.value);
  }
  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value);
  }
  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSelectItem(id: number) {
    const alredySelected = selectedItems.findIndex((item) => item === id);
    if (alredySelected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { name, email, whatsapp } = formData;
    const uf = selectedUF;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;
    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));
    if (selectedFile) {
      data.append('image', selectedFile);
    }
    await api.post('points', data);

    alert('Ponto de coleta criado');

    history.push('/');
  }
  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get('items').then((response) => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
      )
      .then((response) => {
        const ufInitials = response.data.map((uf) => uf.sigla);

        setUfs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedUF === '0') {
      return;
    }
    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`
      )
      .then((response) => {
        const citiesStr = response.data.map((city) => city.nome);
        setCities(citiesStr);
      });
  }, [selectedUF]);

  return (
    <div id='page-create-point'>
      <header>
        <img src={logo} alt='Ecoleta' />

        <Link to='/'>
          <FiArrowLeft /> Voltar para Home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className='field'>
            <label htmlFor='name'>Nome da Entidade</label>
            <input
              type='text'
              name='name'
              id='name'
              onChange={handleInputChange}
            />
          </div>
          <div className='field-group'>
            <div className='field'>
              <label htmlFor='email'>E=mail</label>
              <input
                type='email'
                name='email'
                id='email'
                onChange={handleInputChange}
              />
            </div>
            <div className='field'>
              <label htmlFor='whatsapp'>Whatsapp</label>
              <input
                type='text'
                name='whatsapp'
                id='whatsapp'
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <Marker position={selectedPosition} />
          </Map>
          <div className='field-group'>
            <div className='field'>
              <label htmlFor='uf'>Estado (UF)</label>
              <select
                name='uf'
                id='uf'
                value={selectedUF}
                onChange={handleSelectUF}
              >
                <option value='0'>Selecione uma UF </option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            <div className='field'>
              <label htmlFor='city'>Cidade</label>
              <select
                name='city'
                id='city'
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value='0'>Selecione uma Cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>
          <ul className='items-grid'>
            {items.map((item) => (
              <li
                className={selectedItems.includes(item.id) ? 'selected' : ''}
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type='submit'>Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
