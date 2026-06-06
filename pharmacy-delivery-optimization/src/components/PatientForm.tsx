import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Spin, AutoComplete } from 'antd';
import { Patient } from '../types';

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
  const [addressOptions, setAddressOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (initialPatient) {
      form.setFieldsValue(initialPatient);
    } else {
      form.resetFields();
    }
  }, [initialPatient, form]);

  // Mettre à jour les options d'autocomplétion
  const updateAddressOptions = (nom?: string, prenom?: string) => {
    if (!nom && !prenom) {
      setAddressOptions([]);
      return;
    }

    const filtered = existingPatients.filter(p => 
      p.nom.toLowerCase().includes(nom?.toLowerCase() || '') &&
      p.prenom.toLowerCase().includes(prenom?.toLowerCase() || '')
    );

    const options = filtered.map(patient => ({
      value: patient.adresse,
      label: `${patient.prenom} ${patient.nom} - ${patient.adresse}`,
    }));

    setAddressOptions(options);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);
      await onSubmit({
        nom: values.nom,
        prenom: values.prenom || '',
        adresse: values.adresse,
      });
      form.resetFields();
      message.success(initialPatient ? 'Patient modifié avec succès' : 'Patient ajouté avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      message.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleNomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nom = e.target.value;
    const prenom = form.getFieldValue('prenom');
    updateAddressOptions(nom, prenom);
  };

  const handlePrenomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const prenom = e.target.value;
    const nom = form.getFieldValue('nom');
    updateAddressOptions(nom, prenom);
  };

  const handleAddressSelect = (value: string) => {
    form.setFieldsValue({ adresse: value });
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
        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="prenom"
            label="Prénom"
            style={{ flex: 1 }}
          >
            <Input 
              placeholder="Prénom"
              onChange={handlePrenomChange}
            />
          </Form.Item>

          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
            style={{ flex: 1 }}
          >
            <Input 
              placeholder="Nom"
              onChange={handleNomChange}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="adresse"
          label="Adresse"
          rules={[{ required: true, message: 'Veuillez entrer une adresse' }]}
          help="Les coordonnées GPS seront automatiquement déterminées. Commencez à taper nom + prénom pour l'autocomplétion."
        >
          <AutoComplete
            options={addressOptions}
            onSelect={handleAddressSelect}
            onChange={(value) => form.setFieldsValue({ adresse: value })}
            placeholder="Ex: 133 Avenue du Mahatma Gandhi, 97441 Sainte-Suzanne"
            filterOption={(inputValue, option) => 
              (option?.label?.toLowerCase().includes(inputValue.toLowerCase()) ||
              option?.value?.toLowerCase().includes(inputValue.toLowerCase()) ||
              true)
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PatientForm;
