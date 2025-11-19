import React from 'react';
import './LegalPages.css';

const Returns = () => {
  return (
    <div className="legal-page returns-page">
      <div className="legal-container">
        <h1>Returns & Exchanges</h1>
        <p className="intro-text">
          Your satisfaction is our priority. If you're not completely delighted with your purchase, 
          we're here to help with our straightforward return and exchange policy.
        </p>

        <section>
          <h2>Our Return Policy</h2>
          <div className="policy-highlight">
            <p><strong>30-Day Money-Back Guarantee</strong></p>
            <p>
              We offer a full refund or exchange within 30 days of delivery for items in their original condition.
            </p>
          </div>
        </section>

        <section>
          <h2>Eligible Items</h2>
          <p>To be eligible for a return, your item must meet the following conditions:</p>
          <ul>
            <li>Returned within 30 days of delivery</li>
            <li>In original, unworn, and undamaged condition</li>
            <li>Include all original packaging, tags, certificates, and documentation</li>
            <li>Not have been altered, resized, or modified in any way</li>
            <li>Not be a custom, personalized, or engraved item</li>
          </ul>
        </section>

        <section>
          <h2>Non-Returnable Items</h2>
          <p>The following items cannot be returned:</p>
          <ul>
            <li><strong>Custom Orders:</strong> Items made to your specifications or with special requests</li>
            <li><strong>Engraved Items:</strong> Jewelry with personalized engraving</li>
            <li><strong>Resized Items:</strong> Items that have been resized or altered after purchase</li>
            <li><strong>Earrings:</strong> For hygiene reasons, earrings cannot be returned once worn</li>
            <li><strong>Clearance Items:</strong> Items marked as final sale</li>
            <li><strong>Gift Cards:</strong> Gift cards and e-gift cards are non-refundable</li>
          </ul>
        </section>

        <section>
          <h2>How to Initiate a Return</h2>
          <p>Follow these simple steps to return your item:</p>
          <ol>
            <li>
              <strong>Log In to Your Account</strong>
              <p>Sign in and navigate to "My Orders" in your account dashboard.</p>
            </li>
            <li>
              <strong>Select Your Order</strong>
              <p>Find the order containing the item you wish to return and click "Request Return."</p>
            </li>
            <li>
              <strong>Complete the Return Form</strong>
              <p>Select the item(s), choose a reason for return, and provide any additional comments.</p>
            </li>
            <li>
              <strong>Print Your Return Label</strong>
              <p>You'll receive a prepaid return shipping label via email. Print it and attach it to your package.</p>
            </li>
            <li>
              <strong>Package Your Item</strong>
              <p>Securely pack the item in its original packaging with all accessories and documentation.</p>
            </li>
            <li>
              <strong>Ship Your Return</strong>
              <p>Drop off your package at any authorized carrier location. Keep your receipt as proof of return.</p>
            </li>
          </ol>

          <p className="note">
            <strong>Note:</strong> Return shipping is free for U.S. customers. International customers are responsible 
            for return shipping costs unless the return is due to our error.
          </p>
        </section>

        <section>
          <h2>Exchange Policy</h2>
          <p>
            Want a different size, metal type, or style? We're happy to help! Exchanges follow the same 
            process as returns:
          </p>
          <ul>
            <li>Initiate a return as described above</li>
            <li>Indicate that you'd like an exchange and specify your preferred item</li>
            <li>Once we receive and inspect your return, we'll ship your new item</li>
            <li>If there's a price difference, we'll charge or refund accordingly</li>
          </ul>

          <h3>Ring Sizing</h3>
          <p>
            Need a different ring size? We offer one complimentary resizing within 60 days of purchase 
            for rings purchased from us. Additional resizing services are available for a fee.
          </p>
        </section>

        <section>
          <h2>Refund Process</h2>
          <p>Once we receive your return:</p>
          <ol>
            <li>
              <strong>Inspection (1-2 business days)</strong>
              <p>We'll inspect your item to ensure it meets return criteria.</p>
            </li>
            <li>
              <strong>Approval Email</strong>
              <p>You'll receive an email confirming your return has been approved.</p>
            </li>
            <li>
              <strong>Refund Processing (5-7 business days)</strong>
              <p>Your refund will be issued to your original payment method.</p>
            </li>
            <li>
              <strong>Refund Appears (3-5 business days)</strong>
              <p>Depending on your bank, it may take a few additional days for the refund to appear in your account.</p>
            </li>
          </ol>

          <h3>Refund Amounts</h3>
          <ul>
            <li>Full purchase price of the item(s) returned</li>
            <li>Original shipping costs (if return is due to our error)</li>
            <li>Any taxes paid on the returned item(s)</li>
          </ul>

          <p className="note">
            <strong>Note:</strong> If you received free shipping on your original order and are returning part of your order, 
            you may be charged the original shipping cost if the remaining items don't qualify for free shipping.
          </p>
        </section>

        <section>
          <h2>Damaged or Defective Items</h2>
          <p>
            We take great care in packaging and shipping your jewelry. However, if your item arrives 
            damaged or has a manufacturing defect:
          </p>
          <ul>
            <li>Contact us within 48 hours of delivery</li>
            <li>Provide photos of the damage or defect</li>
            <li>Keep all original packaging</li>
            <li>We'll arrange for immediate replacement or full refund</li>
            <li>Return shipping will be fully covered by us</li>
          </ul>
        </section>

        <section>
          <h2>Wrong Item Received</h2>
          <p>
            If you received the wrong item, we sincerely apologize! Please:
          </p>
          <ul>
            <li>Contact us immediately at info@lafactoriadeloro.com</li>
            <li>Include your order number and a photo of the item received</li>
            <li>We'll arrange for the correct item to be shipped immediately</li>
            <li>Return shipping for the incorrect item will be at our expense</li>
          </ul>
        </section>

        <section>
          <h2>Gift Returns</h2>
          <p>
            If you received a gift and would like to return it:
          </p>
          <ul>
            <li>Returns are accepted with gift receipt or order number</li>
            <li>Refunds will be issued as store credit unless the purchaser requests otherwise</li>
            <li>The gift giver will be notified of the return</li>
            <li>Exchanges for different items are always welcome</li>
          </ul>
        </section>

        <section>
          <h2>Late or Missing Refunds</h2>
          <p>
            If you haven't received a refund within the expected timeframe:
          </p>
          <ol>
            <li>Check your bank account again</li>
            <li>Contact your credit card company (it may take some time before your refund is officially posted)</li>
            <li>Contact your bank (there's often a processing delay)</li>
            <li>If you've done all of this and still haven't received your refund, contact us at info@lafactoriadeloro.com</li>
          </ol>
        </section>

        <section>
          <h2>Warranty Information</h2>
          <p>
            All jewelry from La Factoria Del Oro comes with a lifetime warranty covering:
          </p>
          <ul>
            <li>Manufacturing defects</li>
            <li>Craftsmanship issues</li>
            <li>Metal integrity</li>
            <li>Prong tightening and security checks</li>
          </ul>

          <p>
            The warranty does not cover:
          </p>
          <ul>
            <li>Normal wear and tear</li>
            <li>Accidental damage</li>
            <li>Loss or theft</li>
            <li>Damage from improper care or storage</li>
            <li>Items damaged by third-party repair</li>
          </ul>

          <p>
            For warranty service, contact us with photos and a description of the issue. 
            We'll provide instructions for evaluation and repair.
          </p>
        </section>

        <section>
          <h2>Cleaning & Maintenance Services</h2>
          <p>
            Even if you're not returning an item, we're here for the lifetime of your jewelry:
          </p>
          <ul>
            <li><strong>Free Cleaning:</strong> Bring or mail your jewelry anytime for professional cleaning</li>
            <li><strong>Free Inspection:</strong> We recommend annual inspections to ensure prongs and settings are secure</li>
            <li><strong>Repairs:</strong> Professional repair services available (fees may apply for non-warranty work)</li>
          </ul>
        </section>

        <section>
          <h2>Contact Us for Help</h2>
          <p>
            Have questions about returns or need assistance? We're here to help!
          </p>
          <div className="contact-details">
            <p><strong>Email:</strong> info@lafactoriadeloro.com</p>
            <p><strong>Phone:</strong> (123) 456-7890</p>
            <p><strong>Hours:</strong> Monday - Saturday: 10:00 AM - 7:00 PM EST</p>
          </div>
        </section>

        <section className="faq-cta">
          <h2>Need More Information?</h2>
          <div className="cta-buttons">
            <a href="/faq" className="btn-primary">View FAQ</a>
            <a href="/contact" className="btn-secondary">Contact Support</a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Returns;
