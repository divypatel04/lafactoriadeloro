import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './NewsletterUnsubscribe.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function NewsletterUnsubscribe() {
  const { id } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error, already
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleUnsubscribe();
  }, [id]);

  const handleUnsubscribe = async () => {
    try {
      const response = await axios.post(`${API_URL}/newsletter/unsubscribe`, {
        subscriberId: id
      });

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      
      if (error.response?.data?.message === 'Already unsubscribed') {
        setStatus('already');
        setMessage('You have already unsubscribed from our newsletter.');
      } else {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to unsubscribe. Please try again.');
      }
    }
  };

  return (
    <div className="unsubscribe-page">
      <div className="unsubscribe-container">
        {status === 'loading' && (
          <div className="unsubscribe-content">
            <div className="spinner"></div>
            <h2>Processing your request...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="unsubscribe-content success">
            <div className="icon">✓</div>
            <h2>Successfully Unsubscribed</h2>
            <p>{message}</p>
            <p className="sub-text">
              You will no longer receive newsletters from La Factoria del Oro.
            </p>
            <p className="sub-text">
              We're sorry to see you go. If you change your mind, you can always subscribe again from our website.
            </p>
            <a href="/" className="btn-home">
              Return to Homepage
            </a>
          </div>
        )}

        {status === 'already' && (
          <div className="unsubscribe-content already">
            <div className="icon">ℹ️</div>
            <h2>Already Unsubscribed</h2>
            <p>{message}</p>
            <a href="/" className="btn-home">
              Return to Homepage
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="unsubscribe-content error">
            <div className="icon">⚠️</div>
            <h2>Oops! Something went wrong</h2>
            <p>{message}</p>
            <p className="sub-text">
              Please try again later or contact us directly at{' '}
              <a href="mailto:samitom11jewelry@gmail.com">samitom11jewelry@gmail.com</a>
            </p>
            <a href="/" className="btn-home">
              Return to Homepage
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
