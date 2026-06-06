import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Table, Button, Space, Tag, Popconfirm, message, Checkbox, Input, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Patient } from '../types';

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onToggleColdDelivery: (id: string, hasColdDelivery: boolean) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  loading?: boolean;
}

// Style pour les lignes glissables
const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // styles nécessaires pour le drag & drop
  userSelect: 'none',
  padding: '12px 0',
  margin: `0 0 8px 0`,
  background: isDragging ? '#f0f8ff' : 'transparent',
  border: isDragging ? '1px solid #1890ff' : 'none',
  borderRadius: '4px',
  ...draggableStyle,
});

// Style pour le conteneur des lignes
const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? '#f6ffed' : 'transparent',
  padding: '8px',
  borderRadius: '4px',
});

const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  onEdit,
  onDelete,
  onAdd,
  onToggleColdDelivery,
  onReorder,
  loading,
}) => {
  // Filtres avancés
  const [phoneFilter, setPhoneFilter] = React.useState<string>('');
  const [addressFilter, setAddressFilter] = React.useState<string>('');
  const [coldDeliveryFilter, setColdDeliveryFilter] = React.useState<string>('all'); // 'all', 'yes', 'no'

  // Filtrer les patients en fonction des filtres avancés
  const filteredPatients = patients.filter((patient) => {
    // Ne pas filtrer la pharmacie
    if (patient.isPharmacy) return true;

    // Filtre par téléphone
    if (phoneFilter && !patient.phone?.toLowerCase().includes(phoneFilter.toLowerCase())) {
      return false;
    }

    // Filtre par adresse
    if (addressFilter && !patient.adresse.toLowerCase().includes(addressFilter.toLowerCase())) {
      return false;
    }

    // Filtre par hasColdDelivery
    if (coldDeliveryFilter === 'yes' && !patient.hasColdDelivery) {
      return false;
    }
    if (coldDeliveryFilter === 'no' && patient.hasColdDelivery) {
      return false;
    }

    return true;
  });

  // Vérifier les doublons (nom + prénom + adresse)
  const getDuplicateIds = (): Set<string> => {
    const seen = new Map<string, number>();
    const duplicates = new Set<string>();
    
    patients.forEach((patient) => {
      if (patient.isPharmacy) return;
      const key = `${patient.nom.toLowerCase()}|${patient.prenom.toLowerCase()}|${patient.adresse.toLowerCase()}`;
      if (seen.has(key)) {
        duplicates.add(patient.id);
      } else {
        seen.set(key, 1);
      }
    });
    
    return duplicates;
  };

  const duplicateIds = getDuplicateIds();

  // Gérer le Drag & Drop
  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return; // Déposé en dehors de la liste
    }

    // Ne pas permettre de déplacer la pharmacie
    const draggedPatient = patients[result.source.index];
    if (draggedPatient.isPharmacy) {
      message.warning('La pharmacie ne peut pas être déplacée.');
      return;
    }

    // Calculer les index réels (en ignorant la pharmacie)
    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    onReorder(startIndex, endIndex);
    message.success('Ordre des patients mis à jour.');
  };

  // Rendu d'une ligne de patient avec Drag & Drop
  const renderPatientRow = (patient: Patient, index: number) => (
    <Draggable
      key={patient.id}
      draggableId={patient.id}
      index={index}
      isDragDisabled={patient.isPharmacy}
    >
      {(provided, snapshot) => (
        <tr
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
        >
          <td>
            {patient.isPharmacy ? (
              <Tag color="blue" style={{ marginRight: 8 }}>
                Pharmacie
              </Tag>
            ) : (
              <span>{index}</span>
            )}
          </td>
          <td>
            {patient.prenom && `${patient.prenom} `}{patient.nom}
            {duplicateIds.has(patient.id) && (
              <Tag color="orange" style={{ marginLeft: 8 }}>
                Doublon
              </Tag>
            )}
          </td>
          <td>
            <span style={{ maxWidth: 200, display: 'block' }}>{patient.adresse}</span>
          </td>
          <td>
            <span>{patient.phone || 'N/A'}</span>
          </td>
          <td>
            <Checkbox
              checked={patient.hasColdDelivery || false}
              onChange={(e) => onToggleColdDelivery(patient.id, e.target.checked)}
              disabled={patient.isPharmacy}
            />
          </td>
          <td>
            <Space size="small">
              <Button
                type="link"
                size="small"
                onClick={() => onEdit(patient)}
                disabled={patient.isPharmacy}
              >
                Modifier
              </Button>
              <Popconfirm
                title="Êtes-vous sûr de vouloir supprimer ce patient ?"
                onConfirm={() => {
                  onDelete(patient.id);
                  message.success('Patient supprimé avec succès');
                }}
                okText="Oui"
                cancelText="Non"
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  disabled={patient.isPharmacy}
                >
                  Supprimer
                </Button>
              </Popconfirm>
            </Space>
          </td>
        </tr>
      )}
    </Draggable>
  );

  return (
    <div>
      {/* Filtres avancés */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="Filtrer par téléphone"
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value)}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Input
            placeholder="Filtrer par adresse"
            value={addressFilter}
            onChange={(e) => setAddressFilter(e.target.value)}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="Filtrer par livraison froid"
            value={coldDeliveryFilter}
            onChange={setColdDeliveryFilter}
            style={{ width: '100%' }}
            allowClear
          >
            <Select.Option value="all">Tous</Select.Option>
            <Select.Option value="yes">Avec froid (❄️)</Select.Option>
            <Select.Option value="no">Sans froid</Select.Option>
          </Select>
        </Col>
        <Col span={6} style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={onAdd}
            icon={<span>+</span>}
          >
            Ajouter un patient
          </Button>
        </Col>
      </Row>

      {/* Tableau avec Drag & Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="patients-table">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              <Table
                columns={[
                  {
                    title: '#',
                    key: 'index',
                    width: 50,
                    render: (_, __, index) => index + 1,
                  },
                  {
                    title: 'Nom et Prénom',
                    key: 'fullName',
                    sorter: (a: Patient, b: Patient) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`),
                    render: (_, record) => (
                      <span>
                        {record.prenom && `${record.prenom} `}{record.nom}
                        {duplicateIds.has(record.id) && (
                          <Tag color="orange" style={{ marginLeft: 8 }}>
                            Doublon
                          </Tag>
                        )}
                      </span>
                    ),
                  },
                  {
                    title: 'Adresse',
                    dataIndex: 'adresse',
                    key: 'adresse',
                    sorter: (a: Patient, b: Patient) => a.adresse.localeCompare(b.adresse),
                    render: (text) => <span style={{ maxWidth: 200, display: 'block' }}>{text}</span>,
                  },
                  {
                    title: 'Téléphone',
                    key: 'phone',
                    render: (_, record) => <span>{record.phone || 'N/A'}</span>,
                  },
                  {
                    title: 'Froid',
                    key: 'hasColdDelivery',
                    render: (_, record) => (
                      <Checkbox
                        checked={record.hasColdDelivery || false}
                        onChange={(e) => onToggleColdDelivery(record.id, e.target.checked)}
                        disabled={record.isPharmacy}
                      />
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
                ]}
                dataSource={filteredPatients}
                rowKey="id"
                loading={loading}
                pagination={false}
                size="small"
                components={{
                  body: {
                    row: ({ children, ...rest }: any) => {
                      const index = filteredPatients.findIndex(p => p.id === rest['data-row-key']);
                      if (index === -1) return <tr {...rest}>{children}</tr>;
                      return renderPatientRow(filteredPatients[index], index);
                    },
                  },
                }}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Afficher le nombre de patients filtrés */}
      <div style={{ marginTop: 16, textAlign: 'right', color: '#666' }}>
        {filteredPatients.length} patient(s) affiché(s) sur {patients.length - 1} (hors pharmacie)
        {duplicateIds.size > 0 && (
          <Tag color="orange" style={{ marginLeft: 8 }}>
            {duplicateIds.size} doublon(s)
          </Tag>
        )}
      </div>
    </div>
  );
};

export default PatientTable;
