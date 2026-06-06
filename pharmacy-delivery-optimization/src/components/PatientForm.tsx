import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Spin } from 'antd';
import { Patient } from '../types';
import AddressAutocomplete from './AddressAutocomplete';

interface PatientFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (patient: Omit<Patient, 'id' | 'isPharmacy' | 'latitude' | 'longitude'>) => Promise<void>;
  initialPatient?: Partial<Patient>;
  isGeocoding?: boolean;
  existingPatients?: Patient[];
}

const PatientForm: React.FC<PatientFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialPatient,
  isGeocoding = false,
  existingPatients = [],
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [addressValue, setAddressValue] = useState('');

  useEffect(() => {
    if (initialPatient) {
      form.setFieldsValue(initialPatient);
      setAddressValue(initialPatient.adresse || '');
    } else {
      form.resetFields();
      setAddressValue('');
    }
  }, [initialPatient, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);
      await onSubmit({
        nom: values.nom,
        adresse: addressValue,
      });
      form.resetFields();
      setAddressValue('');
      message.success(initialPatient ? 'Patient modifié avec succès' : 'Patient ajouté avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      message.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (value: string, option: { value: string; label: string; patient?: Patient }) => {
    setAddressValue(value);
    form.setFieldsValue({ adresse: value });
    
    // Si un patient existant est sélectionné, on peut pré-remplir le nom
    if (option.patient && !form.getFieldValue('nom')) {
      form.setFieldsValue({ nom: option.patient.nom });
    }
  };

  return (
    <Modal
      title={initialPatient ? 'Modifier le patient' : 'Ajouter un patient'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Annuler
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading || isGeocoding}
          disabled={isGeocoding}
        >
          {isGeocoding ? 'Géocodage en cours...' : (initialPatient ? 'Modifier' : 'Ajouter')}
        </Button>,
      ]}
      destroyOnClose
      width={600}
    >
      {isGeocoding && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Spin tip="Recherche des coordonnées GPS..." />
        </div>
      )}
      
      <Form
        form={form}
        layout="vertical"
        name="patient_form"
      >
        <Form.Item
          name="nom"
          label="Nom"
          rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
        >
          <Input 
            placeholder="Nom du patient"
            onChange={(e) => {
              // Si on change le nom, on peut essayer de trouver un patient existant
              const name = e.target.value;
              const existing = existingPatients.find(p => p.nom.toLowerCase() === name.toLowerCase());
              if (existing && !addressValue) {
                setAddressValue(existing.adresse);
                form.setFieldsValue({ adresse: existing.adresse });
              }
            }}
          />
        </Form.Item>

        <Form.Item
          name="adresse"
          label="Adresse"
          rules={[{ required: true, message: 'Veuillez entrer une adresse' }]}
          help="Commencez à taper un nom ou une adresse pour voir les suggestions"
        >
          <AddressAutocomplete
            value={addressValue}
            onChange={setAddressValue}
            onSelect={handleAddressSelect}
            patients={existingPatients}
            placeholder="Ex: 133 Avenue du Mahatma Gandhi, 97441 Sainte-Suzanne"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PatientForm;
