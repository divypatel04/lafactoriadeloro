import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './EmailSettings.css';

const EmailSettings = () => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestEmail = async (e) => {
    e.preventDefault();
    
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const response = await api.post('/admin/test-email', { testEmail });
      
      setTestResult({
        success: true,
        message: response.data.message,
        config: response.data.config
      });
      
      toast.success('Test email sent successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to send test email';
      
      setTestResult({
        success: false,
        message: errorMessage
      });
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-settings">
      <div className="email-settings-header">
        <h1>Email Configuration</h1>
        <p>Test and verify your email settings</p>
      </div>

      <div className="email-settings-content">
        <div className="info-card">
          <h3>📧 Email Service Configuration</h3>
          <p>
            Your email service is configured through environment variables. 
            Use this page to test if your email configuration is working correctly.
          </p>
          
          <div className="config-info">
            <h4>Supported Email Services:</h4>
            <ul>
              <li>
                <strong>Gmail:</strong> Set EMAIL_SERVICE=gmail and use Gmail App Password
                <a 
                  href="https://support.google.com/accounts/answer/185833" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="help-link"
                >
                  How to create Gmail App Password
                </a>
              </li>
              <li>
                <strong>SendGrid:</strong> Set EMAIL_SERVICE=sendgrid and use SendGrid API Key
                <a 
                  href="https://docs.sendgrid.com/ui/account-and-settings/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="help-link"
                >
                  Get SendGrid API Key
                </a>
              </li>
              <li>
                <strong>AWS SES:</strong> Set EMAIL_SERVICE=ses and configure AWS credentials
              </li>
              <li>
                <strong>Custom SMTP:</strong> Set EMAIL_SERVICE=smtp and configure host/port
              </li>
            </ul>
          </div>

          <div className="env-example">
            <h4>Example .env Configuration (Gmail):</h4>
            <pre>
{`EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@lafactoriadeloro.com
EMAIL_FROM_NAME=La Factoria Del Oro`}
            </pre>
          </div>
        </div>

        <div className="test-email-card">
          <h3>Test Email Configuration</h3>
          <p>Send a test email to verify your configuration is working</p>
          
          <form onSubmit={handleTestEmail} className="test-email-form">
            <div className="form-group">
              <label htmlFor="testEmail">Test Email Address:</label>
              <input
                type="email"
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email to receive test"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-test-email"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Test Email'
              )}
            </button>
          </form>

          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
              <div className="result-icon">
                {testResult.success ? '✓' : '✗'}
              </div>
              <div className="result-content">
                <h4>{testResult.success ? 'Success!' : 'Error'}</h4>
                <p>{testResult.message}</p>
                {testResult.config && (
                  <div className="result-config">
                    <p><strong>Service:</strong> {testResult.config.service}</p>
                    <p><strong>From:</strong> {testResult.config.from}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="troubleshooting-card">
          <h3>🔧 Troubleshooting</h3>
          
          <div className="troubleshooting-section">
            <h4>Common Issues:</h4>
            
            <div className="issue">
              <strong>Authentication Failed (EAUTH)</strong>
              <ul>
                <li>Gmail: Make sure you're using an App Password, not your regular password</li>
                <li>SendGrid: Verify your API key is correct and has sending permissions</li>
                <li>Check that EMAIL_USER and EMAIL_PASSWORD are set correctly</li>
              </ul>
            </div>

            <div className="issue">
              <strong>Connection Failed (ECONNECTION)</strong>
              <ul>
                <li>Check your EMAIL_HOST and EMAIL_PORT settings</li>
                <li>Verify firewall is not blocking outgoing connections</li>
                <li>For Gmail, make sure "Less secure app access" is enabled if not using App Password</li>
              </ul>
            </div>

            <div className="issue">
              <strong>Email Not Received</strong>
              <ul>
                <li>Check spam/junk folder</li>
                <li>Verify EMAIL_FROM is a valid email address</li>
                <li>For production, set up SPF and DKIM records for your domain</li>
              </ul>
            </div>
          </div>

          <div className="quick-setup">
            <h4>Quick Setup Scripts:</h4>
            <p>Run the setup wizard to configure email:</p>
            <pre>cd backend && node scripts/setup-environment.js</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
