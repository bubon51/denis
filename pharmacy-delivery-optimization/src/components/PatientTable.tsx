import React from 'react';
import { Table, Button, Space, Tag, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Patient } from '../types';

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  loading?: boolean;
}

const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  onEdit,
  onDelete,
  onAdd,
  loading,
}) => {
  const columns: ColumnsType<Patient> = [
    {
      title: 'Nom et Prénom',
      key: 'fullName',
      sorter: (a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`),
      render: (_, record) => (
        <span>
          {record.isPharmacy && (
            <Tag color="blue" style={{ marginRight: 8 }}>
              Pharmacie
            </Tag>
          )}
          {record.prenom && `${record.prenom} `}{record.nom}
        </span>
      ),
    },
    {
      title: 'Adresse',
      dataIndex: 'adresse',
      key: 'adresse',
      sorter: (a, b) => a.adresse.localeCompare(b.adresse),
      render: (text) => <span style={{ maxWidth: 200, display: 'block' }}>{text}</span>,
    },
    {
      title: 'Coordonnées',
      key: 'coordinates',
      render: (_, record) => (
        <span>
          {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
        </span>
      ),
    },

    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => onEdit(record)}
            disabled={record.isPharmacy}
          >
            Modifier
          </Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce patient ?"
            onConfirm={() => {
              onDelete(record.id);
              message.success('Patient supprimé avec succès');
            }}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              type="link"
              size="small"
              danger
              disabled={record.isPharmacy}
            >
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="primary"
          onClick={onAdd}
          icon={<span>+</span>}
        >
          Ajouter un patient
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={patients}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showQuickJumper: false,
        }}
        size="middle"
        bordered
        scroll={{ x: true }}
      />
    </div>
  );
};

export default PatientTable;
