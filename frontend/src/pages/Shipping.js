import React from 'react';
import './LegalPages.css';

const Shipping = () => {
  return (
    <div className="legal-page shipping-page">
      <div className="legal-container">
        <h1>Shipping Information</h1>
        <p className="intro-text">
          At La Factoria Del Oro, we ensure your precious jewelry arrives safely and securely. 
          Learn about our shipping options, delivery times, and policies below.
        </p>

        <section>
          <h2>Shipping Options & Rates</h2>
          
          <div className="shipping-table">
            <table>
              <thead>
                <tr>
                  <th>Shipping Method</th>
                  <th>Delivery Time</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Standard Shipping</strong></td>
                  <td>3-5 business days</td>
                  <td>FREE on orders $500+<br/>$15 on orders under $500</td>
                </tr>
                <tr>
                  <td><strong>Express Shipping</strong></td>
                  <td>1-2 business days</td>
                  <td>$35</td>
                </tr>
                <tr>
                  <td><strong>Overnight Shipping</strong></td>
                  <td>Next business day</td>
                  <td>$65</td>
                </tr>
                <tr>
                  <td><strong>International Shipping</strong></td>
                  <td>7-14 business days</td>
                  <td>Varies by destination</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="note">
            <strong>Note:</strong> Delivery times are estimates and may vary during peak seasons or due to 
            unforeseen circumstances. Business days exclude weekends and holidays.
          </p>
        </section>

        <section>
          <h2>Order Processing</h2>
          <ul>
            <li><strong>Processing Time:</strong> Most in-stock items ship within 1-2 business days of order placement.</li>
            <li><strong>Custom Orders:</strong> Custom and engraved items typically require 2-4 weeks for production before shipping.</li>
            <li><strong>Order Cutoff:</strong> Orders placed before 2:00 PM EST Monday-Friday will be processed the same business day.</li>
            <li><strong>Weekend Orders:</strong> Orders placed on weekends will be processed on the next business day.</li>
          </ul>
        </section>

        <section>
          <h2>Shipping Coverage Areas</h2>
          
          <h3>Domestic Shipping (United States)</h3>
          <p>
            We ship to all 50 states, including Alaska and Hawaii. Additional time may be required for 
            deliveries to Alaska, Hawaii, and U.S. territories.
          </p>

          <h3>International Shipping</h3>
          <p>We currently ship to the following countries:</p>
          <ul className="country-list">
            <li>Canada</li>
            <li>United Kingdom</li>
            <li>Australia</li>
            <li>New Zealand</li>
            <li>European Union Countries</li>
            <li>Japan</li>
            <li>South Korea</li>
            <li>Singapore</li>
            <li>And more...</li>
          </ul>
          <p>
            If your country is not listed, please <a href="/contact">contact us</a> to inquire about shipping availability.
          </p>

          <h3>International Customs & Duties</h3>
          <p>
            International orders may be subject to customs duties, taxes, and fees imposed by the destination country. 
            These charges are the responsibility of the recipient and are not included in our shipping costs. 
            Delivery times may be extended due to customs processing.
          </p>
        </section>

        <section>
          <h2>Tracking Your Order</h2>
          <ul>
            <li>A confirmation email with tracking information will be sent once your order ships.</li>
            <li>Track your order anytime by logging into your account and visiting "My Orders."</li>
            <li>You can also track directly through the carrier's website using your tracking number.</li>
            <li>If you don't receive tracking information within 2 business days, please contact us.</li>
          </ul>
        </section>

        <section>
          <h2>Secure Packaging</h2>
          <p>
            Your jewelry deserves the best care. That's why we:
          </p>
          <ul>
            <li>Package each item in elegant, protective boxes</li>
            <li>Use discreet, unmarked packaging for security</li>
            <li>Include insurance on all shipments</li>
            <li>Require signature confirmation for high-value items</li>
            <li>Use tamper-evident seals for your peace of mind</li>
          </ul>
        </section>

        <section>
          <h2>Signature Requirements</h2>
          <p>
            For your security, orders over $1,000 require an adult signature upon delivery. 
            Please ensure someone 18 or older is available to sign. If no one is available:
          </p>
          <ul>
            <li>The carrier will leave a notice and attempt redelivery</li>
            <li>You can arrange to pick up at the carrier's facility</li>
            <li>You may authorize the carrier to leave the package (at your own risk)</li>
          </ul>
        </section>

        <section>
          <h2>Shipping Delays</h2>
          <p>
            While we strive for timely delivery, delays may occur due to:
          </p>
          <ul>
            <li>Weather conditions or natural disasters</li>
            <li>Carrier delays or service disruptions</li>
            <li>Incorrect or incomplete shipping addresses</li>
            <li>Customs holds for international shipments</li>
            <li>Peak holiday seasons</li>
          </ul>
          <p>
            We will notify you of any significant delays and work with carriers to resolve issues promptly.
          </p>
        </section>

        <section>
          <h2>Address Changes</h2>
          <p>
            Need to change your shipping address? Contact us within 1 hour of placing your order. 
            Once an order has been processed and shipped, we cannot change the delivery address. 
            In such cases, you may need to contact the carrier directly or wait until after delivery to return and re-ship.
          </p>
        </section>

        <section>
          <h2>Missing or Lost Packages</h2>
          <p>
            If your package is marked as delivered but you haven't received it:
          </p>
          <ol>
            <li>Check with neighbors or building management</li>
            <li>Look for a delivery notice from the carrier</li>
            <li>Wait 24 hours (sometimes carriers mark items delivered early)</li>
            <li>Contact the carrier using your tracking number</li>
            <li>If unresolved after 48 hours, contact us for assistance</li>
          </ol>
          <p>
            All of our shipments are insured. We'll work with you to file a claim and replace your item if necessary.
          </p>
        </section>

        <section>
          <h2>Holiday Shipping</h2>
          <p>
            <strong>Important Holiday Notice:</strong> During peak seasons (November-December), we recommend:
          </p>
          <ul>
            <li>Order early to ensure delivery before your desired date</li>
            <li>Choose Express or Overnight shipping for guaranteed delivery</li>
            <li>Allow extra time for custom orders</li>
            <li>Check our website for holiday cutoff dates</li>
          </ul>
        </section>

        <section>
          <h2>P.O. Boxes & Military Addresses</h2>
          <ul>
            <li><strong>P.O. Boxes:</strong> We can ship to P.O. Boxes using USPS services. However, signature confirmation may not be available.</li>
            <li><strong>APO/FPO/DPO:</strong> We're proud to ship to military addresses worldwide. Please allow additional time for delivery.</li>
          </ul>
        </section>

        <section className="faq-cta">
          <h2>Have Questions About Shipping?</h2>
          <p>Our customer service team is ready to help with any shipping-related inquiries.</p>
          <div className="cta-buttons">
            <a href="/contact" className="btn-primary">Contact Us</a>
            <a href="/faq" className="btn-secondary">View FAQ</a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Shipping;
