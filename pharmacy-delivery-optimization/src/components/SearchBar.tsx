import React from 'react';
import { Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Rechercher par nom ou adresse...',
}) => {
  return (
    <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        prefix={<SearchOutlined />}
        allowClear
      />
    </Space.Compact>
  );
};

export default SearchBar;
