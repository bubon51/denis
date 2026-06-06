import React, { useState, useEffect, useRef } from 'react';
import { AutoComplete, Input } from 'antd';
import { Patient } from '../types';

interface AddressAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string, option: { value: string; label: string; patient?: Patient }) => void;
  patients: Patient[];
  placeholder?: string;
  style?: React.CSSProperties;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  patients,
  placeholder = 'Rechercher ou entrer une adresse',
  style,
}) => {
  const [options, setOptions] = useState<{ value: string; label: string; patient?: Patient }[]>([]);
  const [searchText, setSearchText] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filtrer les patients en fonction de la recherche
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (searchText.trim() === '') {
        setOptions([]);
        return;
      }

      // Rechercher par nom ou adresse
      const filtered = patients.filter(p => 
        p.nom.toLowerCase().includes(searchText.toLowerCase()) ||
        p.adresse.toLowerCase().includes(searchText.toLowerCase())
      );

      // Créer des options pour l'autocomplétion
      const newOptions = filtered.map(patient => ({
        value: patient.adresse,
        label: `${patient.nom} - ${patient.adresse}`,
        patient,
      }));

      setOptions(newOptions);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchText, patients]);

  const handleSelect = (value: string, option: { value: string; label: string; patient?: Patient }) => {
    if (onSelect) {
      onSelect(value, option);
    }
    if (onChange) {
      onChange(value);
    }
    setSearchText(value);
  };

  const handleChange = (value: string) => {
    setSearchText(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <AutoComplete
      options={options}
      value={value || searchText}
      onChange={handleChange}
      onSelect={handleSelect}
      filterOption={(inputValue, option) => 
        option?.label?.toLowerCase().includes(inputValue.toLowerCase()) ||
        option?.value?.toLowerCase().includes(inputValue.toLowerCase()) ||
        true
      }
      placeholder={placeholder}
      style={style}
      allowClear
      optionLabelProp="label"
    >
      <Input.TextArea 
        placeholder={placeholder}
        rows={3}
        onChange={(e) => handleChange(e.target.value)}
      />
    </AutoComplete>
  );
};

export default AddressAutocomplete;
