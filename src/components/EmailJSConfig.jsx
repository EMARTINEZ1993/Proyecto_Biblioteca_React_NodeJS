// src/components/EmailJSConfig.jsx
import React, { useState, useEffect } from 'react';


const EmailJSConfig = ({ onConfigComplete }) => {
  const [config, setConfig] = useState({
    serviceId: '',
    templateId: '',
    publicKey: ''
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Verificar si EmailJS ya está configurado
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    
    if (serviceId && templateId && publicKey && 
        serviceId !== 'tu-service-id' && 
        templateId !== 'tu-template-id' && 
        publicKey !== 'tu-public-key') {
      setIsConfigured(true);
      setConfig({ serviceId, templateId, publicKey });
      if (onConfigComplete) {
        onConfigComplete(true);
      }
    }
  }, [onConfigComplete]);

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConfig = () => {
    // En una aplicación real, esto se guardaría en el backend
    // Por ahora, solo mostramos las instrucciones para actualizar .env
    alert(`Para completar la configuración, actualiza tu archivo .env con:\n\nVITE_EMAILJS_SERVICE_ID=${config.serviceId}\nVITE_EMAILJS_TEMPLATE_ID=${config.templateId}\nVITE_EMAILJS_PUBLIC_KEY=${config.publicKey}\n\nLuego reinicia el servidor de desarrollo.`);
  };

  if (isConfigured) {
    return (
      <div>
        <div>
          <span>✅</span>
          <span>EmailJS configurado correctamente</span>
        </div>
        <div>
          <p><strong>Service ID:</strong> {config.serviceId}</p>
          <p><strong>Template ID:</strong> {config.templateId}</p>
          <p><strong>Public Key:</strong> {config.publicKey.substring(0, 8)}...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h3>⚙️ Configuración de EmailJS</h3>
        <p>Para enviar emails reales, necesitas configurar EmailJS</p>
      </div>

      <div>
        <div>
          <label htmlFor="serviceId">Service ID:</label>
          <input
            type="text"
            id="serviceId"
            value={config.serviceId}
            onChange={(e) => handleInputChange('serviceId', e.target.value)}
            placeholder="Ej: service_xxxxxxx"
          />
        </div>

        <div>
          <label htmlFor="templateId">Template ID:</label>
          <input
            type="text"
            id="templateId"
            value={config.templateId}
            onChange={(e) => handleInputChange('templateId', e.target.value)}
            placeholder="Ej: template_xxxxxxx"
          />
        </div>

        <div>
          <label htmlFor="publicKey">Public Key:</label>
          <input
            type="text"
            id="publicKey"
            value={config.publicKey}
            onChange={(e) => handleInputChange('publicKey', e.target.value)}
            placeholder="Ej: xxxxxxxxxxxxxxxx"
          />
        </div>

        <div>
          <button 
            type="button" 
            onClick={handleSaveConfig}
            disabled={!config.serviceId || !config.templateId || !config.publicKey}
          >
            Guardar Configuración
          </button>
          
          <button 
            type="button" 
            onClick={() => setShowInstructions(!showInstructions)}
          >
            {showInstructions ? 'Ocultar' : 'Ver'} Instrucciones
          </button>
        </div>
      </div>

      {showInstructions && (
        <div>
          <h4>📋 Cómo obtener las credenciales de EmailJS:</h4>
          <ol>
            <li>
              <strong>Crear cuenta:</strong>
              <br />Ve a <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer">emailjs.com</a> y crea una cuenta gratuita
            </li>
            <li>
              <strong>Configurar servicio de email:</strong>
              <br />En el dashboard, ve a "Email Services" y conecta tu Gmail
            </li>
            <li>
              <strong>Crear template:</strong>
              <br />Ve a "Email Templates" y crea un template con estas variables:
              <ul>
                <li><code>{'{{to_email}}'}</code> - Email del destinatario</li>
                <li><code>{'{{to_name}}'}</code> - Nombre del destinatario</li>
                <li><code>{'{{reset_code}}'}</code> - Código de recuperación</li>
                <li><code>{'{{from_name}}'}</code> - Nombre del remitente</li>
                <li><code>{'{{expiry_time}}'}</code> - Tiempo de expiración</li>
              </ul>
            </li>
            <li>
              <strong>Obtener credenciales:</strong>
              <br />Copia el Service ID, Template ID y Public Key desde el dashboard
            </li>
            <li>
              <strong>Configurar aplicación:</strong>
              <br />Actualiza el archivo <code>.env</code> con tus credenciales y reinicia el servidor
            </li>
          </ol>
          
          <div>
            <strong>⚠️ Importante:</strong> En producción, estas credenciales deben manejarse en el backend por seguridad.
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailJSConfig;