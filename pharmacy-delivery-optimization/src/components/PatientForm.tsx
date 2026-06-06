import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, message } from 'antd';
import { Patient } from '../types';
import { REUNION_BOUNDS } from '../types';

interface PatientFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (patient: Omit<Patient, 'id' | 'isPharmacy'>) => void;
  initialPatient?: Partial<Patient>;
}

const PatientForm: React.FC<PatientFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialPatient,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPatient) {
      form.setFieldsValue(initialPatient);
    } else {
      form.resetFields();
    }
  }, [initialPatient, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Vérifier que les coordonnées sont dans les limites de La Réunion
      if (
        values.latitude < REUNION_BOUNDS[0][0] ||
        values.latitude > REUNION_BOUNDS[1][0] ||
        values.longitude < REUNION_BOUNDS[0][1] ||
        values.longitude > REUNION_BOUNDS[1][1]
      ) {
        message.error('Les coordonnées doivent être sur l\'île de La Réunion');
        return;
      }

      setLoading(true);
      onSubmit({
        nom: values.nom,
        adresse: values.adresse,
        latitude: values.latitude,
        longitude: values.longitude,
        tempsLivraison: values.tempsLivraison,
      });
      form.resetFields();
    } catch (error) {
      console.error('Erreur de validation:', error);
    } finally {
      setLoading(false);
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
          loading={loading}
        >
          {initialPatient ? 'Modifier' : 'Ajouter'}
        </Button>,
      ]}
      destroyOnClose
    >
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
          <Input placeholder="Nom du patient" />
        </Form.Item>

        <Form.Item
          name="adresse"
          label="Adresse"
          rules={[{ required: true, message: 'Veuillez entrer une adresse' }]}
        >
          <Input.TextArea
            placeholder="Adresse complète"
            rows={2}
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="latitude"
            label="Latitude"
            rules={[
              { required: true, message: 'Veuillez entrer une latitude' },
              {
                type: 'number',
                min: REUNION_BOUNDS[0][0],
                max: REUNION_BOUNDS[1][0],
                message: `La latitude doit être entre ${REUNION_BOUNDS[0][0]} et ${REUNION_BOUNDS[1][0]}`,
              },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber
              placeholder="Latitude"
              precision={6}
              step={0.0001}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="longitude"
            label="Longitude"
            rules={[
              { required: true, message: 'Veuillez entrer une longitude' },
              {
                type: 'number',
                min: REUNION_BOUNDS[0][1],
                max: REUNION_BOUNDS[1][1],
                message: `La longitude doit être entre ${REUNION_BOUNDS[0][1]} et ${REUNION_BOUNDS[1][1]}`,
              },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber
              placeholder="Longitude"
              precision={6}
              step={0.0001}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="tempsLivraison"
          label="Temps de livraison (minutes)"
          rules={[
            { required: true, message: 'Veuillez entrer un temps de livraison' },
            { type: 'number', min: 0, max: 120, message: 'Le temps doit être entre 0 et 120 minutes' },
          ]}
        >
          <InputNumber
            placeholder="Temps de livraison"
            min={0}
            max={120}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PatientForm;
